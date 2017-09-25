const bunyan = require('bunyan');
const path = require('path');

const logger = bunyan.createLogger({
    name: 'app',
    streams: [{
        type: 'rotating-file',
        path: process.env.ROOTDIR ? path.join(process.env.ROOTDIR, 'app.log') :
            path.join(__dirname, './../../app.log'),
        period: '1d',
        count: 3,
    },
    ],
});

module.exports = {
    /**
     * Create logger with name passed in as loggerName
     * @param {any} childLoggerName - name of child logger, generally file name
     * @returns {Object} - returns a child logger object
     */
    createChildLogger(childLoggerName) {
        return logger.child({
            context: childLoggerName,
        });
    },
};
