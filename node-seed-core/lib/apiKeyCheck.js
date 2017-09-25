var errors = require('./core/errors');
var config = require('config');
var _ = require('lodash');

var apiKeys = config.has('apiKeys') ? config.get('apiKeys') : null;

/**
 * Check if api key is valid.
 * @param {String} apiKey - api key
 * @return check result object with keys: valid (boolean) and clientType (String, if valid)
 */
function checkApiKey(apiKey) {

    if (!_.isString(apiKey)) {
        return { valid: false };
    }

    //check for valid api_key
    var clientType = _.findKey(apiKeys, function (value) {
        return value === apiKey;
    });

    if (_.isString(clientType)) {
        return { valid: true, clientType: clientType };
    } else {
        return { valid: false };
    }
}

/**
 * Enforces request to have a valid api_key, or forwards an api error.
 * @param {Request} req - express request.
 * @param {Response} res - express response.
 * @param {function(Error)} next - next callback.
 */
function middlewareCheckApiKey(req, res, next) {
    // get api_key from header, or query string
    var apiKey = req.get('api_key') || _.get(req.query, 'api_key');
    if (apiKeys) {
        // check key for validity
        var result = checkApiKey(apiKey);

        if (result.valid) {
            // set client type and proceed
            req.clientType = result.clientType;
            next();
        } else {
            // send error
            return next(errors.invalid_key());
        }
    }
}

/**
 * Export functions.
 */
module.exports = {
    checkApiKey: checkApiKey,
    middleware: middlewareCheckApiKey
};
