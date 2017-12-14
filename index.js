process.env.ROOTDIR = __dirname;
const lib = require('api-lib');
require('node-seed-core')
    .globalConfigure(lib.plugins.validationFormats,
    lib.plugins.schemaDefinitions);
const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const compression = require('compression');
const path = require('path');
const Promise = require('bluebird');
const Controller = require('node-seed-core').Controller;
const jsonParser = require('node-seed-core').jsonBodyParser;
const cors = require('cors');

const setupSwagger = lib.swagger;
const app = express();

// Set global middlewares
app.use(jsonParser({ limit: '50mb', }));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
}));
app.use(compression());
app.use(cors());

//  Mount routes
const apiRouter = express.Router();
app.use(config.get('server.apiPath'), apiRouter);
const controllers = [];

// Use method below to mount middleware to implement ACL
// Controller.initAuth(authMiddlewares.authorize);

// Find an mount controllers into express
Controller.walkModulesSync(path.join(__dirname, 'controllers'),
    (controller) => {
        controller.mount(apiRouter);
        controllers.push(controller);
    });

//  Initialize swagger documentaion
if (config.has('enableSwagger') && config.get('enableSwagger')) {
    const apiMetadata = Controller.generateAPIDoc(
        path.join(__dirname, 'package.json'),
        controllers);
    setupSwagger(app, apiMetadata);
    app.use('/api/docs', express.static(path.join(__dirname, 'swagger')));
}

//  Add error handler middleware after all other routes have been added
app.use(lib.middlewares.responseHandler.OkHandler);

// The error handler must be before any
app.use(lib.middlewares.responseHandler.ErrorHandler);

//  boot server
const listenAsync = Promise.promisify(app.listen, {
    context: app,
});

//  Connect to database

listenAsync(config.get('server.port')).then(() => {

}).catch((err) => {
    throw err;
});

process.on('SIGINT', () => {

});
