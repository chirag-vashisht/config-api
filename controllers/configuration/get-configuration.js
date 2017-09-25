const ApiResponse = require('api-lib').core.ApiResponse;
const HttpStatusCode = require('http-status-codes');
const Controller = require('node-seed-core').Controller;
const configHelper = require('../../modules/app-config').helpers.configHelper;

const appConfigController = new Controller();

/**
 * Setup routing for config related API's
 */
module.exports = appConfigController;

appConfigController.use((request, response, next) => {
    configHelper.getConfigByNamespace(request.params.namespace, true)
        .then((result) => {
            response.locals.apiResponse =
                new ApiResponse(HttpStatusCode.OK, result);
            next();
        }).catch((err) => {
            next(err);
        });
});
