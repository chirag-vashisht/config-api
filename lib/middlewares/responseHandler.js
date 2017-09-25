const HttpStatus = require('http-status-codes');
const ApiResponse = require('./../core/responses');
const logger = require('./../logging/logger').getChildLogger(__filename);
const ApiError = require('node-seed-core').errors.ApiError;
const errors = require('../core').errors;
const config = require('config');
const enums = require('../core').enums;

const logLevel = config.has('logger.level') ? config.get('logger.level')
    : enums.log.level.undefined;


module.exports = {
    /**
    * Error handling middleware
    * @param {any} err - Error that should be sent in response
    * @param {any} req - request
    * @param {any} res - request
    * @param {any} next - Next handler to be called
    * @returns {undefined}
    */
    ErrorHandler(err, req, res, next) {
        let error = err;
        if (res.headersSent) {
            next(error);
        }
        if (!(err instanceof ApiError)) {
            error = errors.internal_error(err);
        }
        const errorLevel = error.level || enums.log.level.undefined;
        // Set the eventId and in response if it was passed in the request
        const eventId = req.get('eventId');
        if (eventId) {
            res.set('eventId', eventId);
        }
        if (logLevel <= errorLevel ||
            !(err instanceof ApiError)) {
            if (req.body.password) {
                req.body.password = '*****';
            }
            logger.error({
                error,
                request: {
                    method: req.method,
                    path: req.path,
                    body: req.body,
                    query: req.query,
                    params: req.params,
                },
            }, error.message);
        }
        error.sendTo(res);
    },
    OkHandler(req, res) {
        const apiResponse = res.locals.apiResponse;
        const eventId = req.get('eventId');
        if (apiResponse instanceof ApiResponse) {
            // Set the eventId and in response if it was passed in the request
            if (eventId) {
                res.set('eventId', eventId);
            }
            return res.status(apiResponse.statusCode || HttpStatus.OK)
                .json(apiResponse.data);
        }
        return res.status(HttpStatus.NOT_FOUND).json(apiResponse);
    },
};
