const tradeDataModel = require('../models/tradeData');
const _ = require('lodash');

module.exports = {
    /**
     * Gets the trade data sorted
     * @returns {Array} - trades
     */
    getTrades() {
        const trades = tradeDataModel.getTrades();
        return _.sortBy(trades, [
            'Symbol', 'Action', 'TxnId',
        ]);
    },

    getCalculatedTrades() {
        const trades = tradeDataModel.getTrades();
        const hashUnitPrice = {};
        const calculatedTrades = _.map(trades, (trade) => {
            const item = trade;
            const marketValue = item.Quantity * item.Price;
            if (item.Action === 'Buy') {
                item.MarketValue = marketValue;
                item.PL = 0;
                if (hashUnitPrice[item.Symbol]) {
                    hashUnitPrice[item.Symbol].totalBuyValue += marketValue;
                    hashUnitPrice[item.Symbol]
                        .totalBuyQuantity += item.Quantity;
                } else {
                    hashUnitPrice[item.Symbol] = {};
                    hashUnitPrice[item.Symbol].totalBuyValue = marketValue;
                    hashUnitPrice[item.Symbol].totalBuyQuantity = item.Quantity;
                }
            } else {
                item.MarketValue = -1 * marketValue;
            }
            return item;
        });
        for (let idx = 0; idx < calculatedTrades.length; idx += 1) {
            const trade = calculatedTrades[idx];
            if (!trade.PL) {
                const buyUnitPrice =
                    hashUnitPrice[trade.Symbol].totalBuyValue /
                    hashUnitPrice[trade.Symbol].totalBuyQuantity;
                trade.PL = (-1 * trade.marketValue) -
                    (buyUnitPrice * trade.Quantity);
            }
        }
        return _.sortBy(calculatedTrades, [
            'Symbol', 'Action', 'TxnId',
        ]);
    },
};
