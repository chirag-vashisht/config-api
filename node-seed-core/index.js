// Node module: node-adapter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

exports.Controller = require('./lib/core/Controller');
exports.TestController = require('./lib/core/TestController');
exports.globalConfigure = require('./lib/globalConfigure');
exports.apiKeyCheck = require('./lib/apiKeyCheck');
exports.jsonBodyParser = require('./lib/jsonBodyParser');
exports.errors = require('./lib/core/errors');
exports.errorHandler = require('./lib/core/errorHandler');