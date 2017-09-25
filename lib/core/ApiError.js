const util = require('util');
const _ = require('lodash');
const errStackParser = require('error-stack-parser');
const CoreError = require('node-seed-core').errors.ApiError;
const enums = require('./enums');

/**
 * Adds useful methods to errors. Use this to create new type of errors.
 * @param {String} context - Context that can
 * be used to identify origin of error.
 * @param {Number} statusCode - HTTP response code.
 * @param {String} details - error details.
 * @param {*} stackFrames - error stack frames.
 * @param {Number} errorLevel - Error's severity level
 * @returns {undefinded} - undefined
 */
function ApiError(context, statusCode,
    details, stackFrames, errorLevel) {
    this.level = errorLevel || enums.log.level.undefined;
    CoreError.call(this, statusCode, context, details, stackFrames);
}

/**
 * Genreates a function to create ApiError when called.
 * @param {Number} httpCode - HTTP response code.
 * @param {Number} errorCode - error code.
 * @param {String} description - error description.
 * @param {Number} errorLevel - Error's severity level
 * @returns {ApiError} - ApiError
 */
ApiError.create = function create(httpCode, errorCode,
    description, errorLevel) {
    return (nativeError) => {
        // create error stack frames (drop the first one for this function call)
        let stackFrames = _.drop(errStackParser.parse(new Error(errorCode)), 1);

        // filter out node's internal and node_module file links
        stackFrames = stackFrames.filter(sf => _.startsWith(sf.fileName, '/') &&
            sf.fileName.indexOf('node_modules') < 0);

        let message = null;
        if (nativeError instanceof Error &&
            nativeError.stack) {
            try {
                const nativeStackFrames = errStackParser.parse(nativeError);
                stackFrames = nativeStackFrames.concat(stackFrames);
                message = nativeError.message;
            } catch (err) {
                message = _.toString(nativeError);
            }
        } else {
            message = _.toString(nativeError);
        }

        // return a new error instance, with error stack trace
        const error = new ApiError(errorCode, httpCode,
            description, stackFrames, errorLevel);
        error.message = message || description;
        return error;
    };
};

util.inherits(ApiError, CoreError);

// expose constructor
module.exports = ApiError;
