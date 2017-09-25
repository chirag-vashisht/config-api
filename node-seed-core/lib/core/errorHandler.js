var util = require('util');
var _ = require('lodash');
var errors = require('./errors');
var logger = require('../logger');

/**
 * Error handling middleware that responds with formatted error JSON.
 * @param {*} err - error.
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function(err)} next - express next.
 */
var errorHandler = function(err, req, res, next) {

    if (res.headersSent) {
        // response sending already started
        res.end();
        logger.warn('Error', 'errorHandler: Request headers already sent. Cannot respond with error.', {});
    } else if (err instanceof errors.ApiError) {
        // api error
        err.sendTo(res);
    } else {
        // other error
        logger.error('Error', 'internal error', err);
        errors.internal_error().withDetails(inspectDetails(err)).sendTo(res);
    }

    // proceed
    next();
}
module.exports = errorHandler;


/**
 * Inspect err object and return related error detail if any.
 * @param {*} err - error to inspect.
 * @return error details, or nothing.
 */
function inspectDetails(err) {

    // native mongo driver errors, forwarded by mongoose
    if (err instanceof Error && err.name === "MongoError" && err.driver) {
        if (err.code == 11000) { // unique index conflict
            return ['Resource document already exists.'];
        }
    }

    // mongoose errors
    if ("MongooseError" === _.get(err, 'constructor.name')) {
        if (err.name === "ValidationError") { // schema validation failed
            var details = [];
            extractMongooseValidationDetails(details, err.errors);
            return details;
        }
    }

    // generic errors
    if (err instanceof Error && _.has(err, 'message')) {
        return err.message;
    }

    // return generic message
    return 'Internal Server Error.'
}

/**
 * Extract mongoose validation error tree to flat array.
 * @param {Array} details - array to populate. Empty array for start.
 * @param {Object} errors - mongoose errors object.
 */
function extractMongooseValidationDetails(details, errors) {

    // log path and message if exist
    if (_.isString(errors.path) && _.isString(errors.message)) {
        details.push({
            path: errors.path,
            message: errors.message
        });
    }

    // recurse
    _.forOwn(errors, function(e) {
        if ("MongooseError" === _.get(e, 'constructor.name')) {
            extractMongooseValidationDetails(details, e);
        }
    });
}
