var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var path = require('path');
var tv4 = require('tv4');
var errors = require('./errors');
var configSchema = require('./configSchema.json');
var async = require('async');
var appConfig = require('config');
var checkAuth = null;

/**
 * Defines a request handling route. A route can:
 * 1. Handle HTTP requests for a particular url path with particular HTTP method.
 * 2. Enforce access on requests, by user type and further by permissions, if required.
 * 3. Enriches request with current "user" property on authentication.
 * 4. Validate and filter request input including request body, query and path params.
 * 5. Chain arbitrary express middleware for handling the request.
 * @constructor
 */
function Controller() {
    // route data members
    this.middlewares = [];
    this.userTypes = [];
    this.permissions = [];
    this.isPublic = false;
    this.accepts = {};
    this.config = {};
};

// Inherits from Object
util.inherits(Controller, Object);

/**
 * Controller class.
 * @type {Route}
 */
module.exports = Controller;

/**
 * Allowed HTTP methods for Route.
 * @type {string[]}
 */
Controller.REQUEST_METHODS = ['get', 'post', 'put', 'delete', 'head', 'patch'];

/**
 * Use one or more middleware on this route. Multiple middleware can be provided as arguments to this function.
 * @param {function} middleware - middleware function(s).
 * @return route object.
 */
Controller.prototype.use = function () {

    for (var i = 0; i < arguments.length; i++) {
        var mw = arguments[i];

        if (_.isFunction(mw)) {
            this.middlewares.push(mw);
        } else {
            throw new Error("Arguments should be middleware functions");
        }
    }

    // return for chained calls
    return this;
};


/**
 * Make route require one or more authenticated user type (user model name, case sensitive).
 * Multiple types can be provided as arguments to this function.
 * @param {String} userType - user type(s).
 * @return route object.
 */
Controller.prototype.allowUserTypes = function () {

    // iterate arguments
    for (var i = 0; i < arguments.length; i++) {
        var userType = arguments[i];

        if (_.isString(userType)) {
            // add user type if not already added
            if (this.userTypes.indexOf(userType) < 0) {
                this.userTypes.push(userType);
            }
        } else {
            // not a string
            throw new Error("Arguments should be user type Strings.");
        }
    }

    // return for chained calls
    return this;
};

/**
 * Make route require ALL of given access permissions to be present in calling user.
 * Multiple permissions can be provided as arguments to this function.
 * Note: Must set at least one user type first.
 * @param {String} permission - access permission(s).
 * @return route object.
 */
Controller.prototype.requirePermissions = function () {

    if (this.userTypes.length < 1) {
        // permissions check requires a user type check to be set first.
        throw new Error("At least one user type must be set to use permissions. Use allowUserTypes() to set user types first.");
    }

    // iterate arguments
    for (var i = 0; i < arguments.length; i++) {
        var permission = arguments[i];

        if (_.isString(permission)) {
            // add permission if not already added
            if (this.permissions.indexOf(permission) < 0) {
                this.permissions.push(permission);
            }
        } else {
            // not a string
            throw new Error("Arguments should be permission Strings.");
        }
    }

    // return for chained calls
    return this;
};


/**
 * Set route as publicly accessible.
 * @return route object.
 */
Controller.prototype.setPublic = function () {

    // mark public
    this.isPublic = true;

    // return for chained calls
    return this;
};

/**
 * Set the route to validate request body JSON with given tv4 validator schema.
 * @param {Object} schema - validation schema.
 * @return route object.
 */
Controller.prototype.validateInputBody = function (schema) {

    if (!_.isObject(schema)) {
        // not an object
        throw new Error("Schema must be an Object");
    }

    // set body validation schema
    this.accepts.body = schema;

    // return for chained calls
    return this;
};

/**
 * Set the route to validate request query JSON with given tv4 validator schema.
 * @param {Object} schema - validation schema.
 * @return route object.
 */
Controller.prototype.validateInputQuery = function (schema) {

    if (!_.isObject(schema)) {
        // not an object
        throw new Error("schema must be an Object");
    }

    // set query validation schema
    this.accepts.query = schema;

    // return for chained calls
    return this;
};

/**
 * Set the route to validate request path params JSON with given tv4 validator schema.
 * @param {Object} schema - validation schema.
 * @return route object.
 */
Controller.prototype.validateInputParams = function (schema) {

    if (!_.isObject(schema)) {
        // not an object
        throw new Error("schema must be an Object");
    }

    // set path params validation schema
    this.accepts.params = schema;

    // return for chained calls
    return this;
};

/**
 * Mount this route on given express Router.
 * @param {Object} router - express Router.
 */
Controller.prototype.mount = function (router) {

    // middlewares to mount
    var mountMiddlewares = [];

    if (!this.isPublic || this.userTypes.length > 0) {
        if (!checkAuth) {
            throw new Error('Middleware for auth is not set yet! Use Controller.initAuth to set a middleware');
        }
        mountMiddlewares.push(_.partial(checkAuth, this.userTypes, this.permissions, this.isPublic));
    }

    var self = this;
    if (!self.config.skipValidation) {
        _.keys(this.accepts).forEach(function (key) {
            // add request key schema validation
            mountMiddlewares.push(_.partial(validateRequestData, self.accepts[key], key));
        });
    }

    // append route middlewares
    mountMiddlewares = mountMiddlewares.concat(this.middlewares);

    // mount route on provided router.
    router[this.method](this.path, mountMiddlewares);
};

/**
 * Synchronously and recursively walk the given directory and load modules of given type.
 * Provided handler is called for each loaded module.
 * Note: All modules in directory should be of given type.
 *
 * @param {String} rootPath - directory to walk.
 * @param {function} type - module class for "instance of" matching.
 * @param {function(*)} handler - module load handler.
 */
Controller.walkModulesSync = function (rootPath, handler) {

    var files = fs.readdirSync(rootPath);

    for (var i = 0; i < files.length; i++) {

        var filePath = path.join(rootPath, files[i]);

        var stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // recurse into sub directory
            Controller.walkModulesSync(filePath, handler);

        } else if (!_.startsWith(files[i], '.') && path.extname(filePath) === '.js') {
            var module = require(filePath);
            if (module instanceof Controller) {
                var extension = path.extname(filePath);
                var configPath = path.join(rootPath, path.basename(filePath, extension) + '.json');
                var routeConfig = null;
                if (fs.existsSync(configPath)) {
                    routeConfig = require(configPath);
                }
                if (routeConfig) {
                    assignConfiguration.call(module, routeConfig);
                }
                handler(module);
            } else {
                //throw new Error('Invalid module type found:' + (typeof module) + '. Required: ' + (typeof Controller));
            }
        }
    }
};

/**
 * Applies request body JSON avlidation as per schema.
 * @param {Object} schema - validation schema.
 * @param {String} key - request property to validate.
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function(err)} next - express next.
 */
function validateRequestData(schema, key, req, res, next) {
    if (key === 'formData') {
        key = 'body';
    }
    // make validation
    var data = req[key];
    const definitions = tv4.getSchema('');
    const mergedSchema = Object.assign(schema, definitions);
    var result = tv4.validateResult(data, mergedSchema, false, key !== 'headers');

    if (result.valid) {
        next();
    } else {
        _.unset(result, 'error.stack');
        _.unset(result, 'error.schemaPath');

        // not valid, send error with validation issues as details
        next(errors.invalid_input().withDetails(result));
    }
};

/**
 * Generates json that shall be consumed by swagger-ui to
 * show the documentation of the api
 * @param {string} pathAppInfo - path to package json
 * @param {array} routes - an array of mounted routes
 * @returns {object} - json metadata for swagger ui
 */
Controller.generateAPIDoc = function (pathAppInfo, routes) {
    const definitions = tv4.getSchema('');
    var appInfo = require(pathAppInfo);
    var apiPath = appConfig.server.apiPath;
    var doc = {
        info: {
            title: appInfo.name,
            description: appInfo.description,
            version: appInfo.version
        },
        paths: {},
        schemes: ['http', 'https'],
        definitions: definitions ? definitions.definitions : {},
        basePath: apiPath,
        swagger: "2.0"
    };
    doc.securityDefinitions = {
        access_token: {
            type: 'apiKey',
            name: 'access_token',
            in: 'header'
        }
    };
    for (var index = 0; index < routes.length; index++) {
        var route = routes[index];
        populateRouteInfo(doc, route);
    }
    return doc;
}

Controller.initAuth = function (auth) {
    checkAuth = auth;
}


function assignConfiguration(config) {
    var result = tv4.validateResult(config, configSchema, false, false);
    if (!result.valid) {
        console.error(result);
        throw new Error('Invalid route config! ' + result.toString());
    }
    if (_.isString(config.method)) {
        // method should be lower case
        config.method = config.method.toLowerCase();
    }
    if (!_.includes(Controller.REQUEST_METHODS, config.method)) {
        // not a valid method name
        throw new Error("Method must be one of:[" + Controller.REQUEST_METHODS.join(",") + "]");
    }

    if (!_.isString(config.path) || config.path.length < 0) {
        // not a valid path
        throw new Error("Path must be a String");
    }
    this.method = config.method;
    this.path = config.path;
    this.accepts = config.accepts ? Object.assign(this.accepts, config.accepts) : this.accepts;
    this.isPublic = config.isPublic;
    this.config = config;
    this.userTypes = config.userTypes;
    this.permissions = config.permissions;
}

function populateRouteInfo(doc, route) {
    var routeInfo = {};
    var routePath = route.path;
    routeInfo.tags = route.config.tags;
    routeInfo.summary = route.config.summary;
    routeInfo.description = route.config.description;
    routeInfo.operationId = route.config.operationId;
    routeInfo.deprecated = route.config.deprecated;
    routeInfo.responses = route.config.returns;
    routeInfo.parameters = [];
    routeInfo.consumes = route.config.consumes;
    routeInfo.produces = route.config.produces;
    if (!route.config.isPublic) {
        routeInfo.security = [{ access_token: [] }];
        // routeInfo.parameters.push({
        //     type: 'string',
        //     name: 'access_token',
        //     in: 'header',
        //     description: 'User auth token',
        //     required: true
        // });
    }
    _.keys(route.config.accepts).forEach(function (key) {
        if (key === 'body') {
            var parameter = {
                name: route.config.accepts[key].modelName,
                in: key,
                description: route.config.accepts[key].description,
                required: true,
                schema: route.accepts[key]
            }
            routeInfo.parameters.push(parameter);
        }
        else {
            var paramIn = key;
            _.keys(route.accepts[key].properties).forEach(function (prop) {
                if (key === 'params') {
                    paramIn = 'path';
                    routePath = routePath.replace(':' + prop, '{' + prop + '}');
                }
                if (key === 'headers') {
                    paramIn = 'header';
                }
                var parameter = {
                    name: prop,
                    in: paramIn,
                    type: route.accepts[key].properties[prop].type,
                    description: route.accepts[key].properties[prop].description,
                    required: _.indexOf(route.accepts[key].required, prop) > -1,
                    schema: route.accepts[key].properties[prop]
                }
                routeInfo.parameters.push(parameter);
            });
        }
    });
    if (!doc.paths[routePath]) {
        doc.paths[routePath] = {};
    }
    doc.paths[routePath][route.method] = routeInfo;
}