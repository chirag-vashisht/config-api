const logger = require('./bunyanLogger');

module.exports = {
    /**
     * Get a logger with specified name
     * @param {any} name - name
     * @returns {undefined} - undefined
     */
    getChildLogger(name) {
        return logger.createChildLogger(name);
    },
};
