const ApiResponse = require('api-lib').core.ApiResponse;
const HttpStatusCode = require('http-status-codes');
const Controller = require('node-seed-core').Controller;
const tradeHelper = require('../../modules/trade-blotter').helpers.tradeHelper;

const appConfigController = new Controller();

/**
 * Setup routing for config related API's
 */
module.exports = appConfigController;

appConfigController.use((request, response, next) => {
    const trades = tradeHelper.getCalculatedTrades();
    response.locals.apiResponse =
        new ApiResponse(HttpStatusCode.OK, trades);
    next();
});
