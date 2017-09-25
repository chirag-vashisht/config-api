var mongoose = require('mongoose');
var Promise = require('bluebird');
var request = require('superagent');
var tv4 = require('tv4');

/**
 * Sets up app wide, global configuration of node modules.
 * Must be executed before everything else.
 * @param {Object} - validation formats to be configured
 * @param {Object} - schema definitions
 * @returns {Undefined} - Undefined
 */
module.exports = function (validationFormats, definitions) {
    configureBluebird();
    configureMongoose();
    configureTv4(validationFormats, definitions);
    configureSuperAgent();
    configureStringFormat();
}

/**
 * Configure bluebird module.
 */
function configureBluebird() {
    // configure bluebird
    Promise.config({
        // Enables all warnings except forgotten return statements.
        warnings: false,
        longStackTraces: false,
        // Enable cancellation.
        cancellation: true
    });
}



/**
 * Configure mongoose module.
 */
function configureMongoose() {
    // set mongoose to use blue bird
    mongoose.Promise = Promise;
}



/**
 * Configure tv4 module.
 */
function configureTv4(validationFormats, definitions) {
    // add custom formats to tv4
    tv4.addFormat(require('./tv4Formats'));
    if (validationFormats) {
        tv4.addFormat(validationFormats);
    }
    if (definitions) {
        tv4.addSchema('', { definitions });
    }
}



/**
 * Configure superagent module.
 */
function configureSuperAgent() {
    // add exec() method to super agent request that returns a cancellable promise
    request.Request.prototype.exec = function () {

        // request reference
        var req = this;

        // return a promise
        return new Promise(function (resolve, reject, onCancel) {

            // abort request on promise cancel
            onCancel(function () {
                req.abort();
            });

            // resolve/reject promise as per callback
            req.end(function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });

        });
    };
}

/**
 * Configure String Format method.
 */
function configureStringFormat() {
    if (!String.format) {
        String.format = function (format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }
}
