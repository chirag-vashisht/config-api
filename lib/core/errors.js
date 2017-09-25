const messages = require('./error-messages');
const ApiError = require('./ApiError');

const errors = {};
(() => {
    const keys = Object.keys(messages);
    keys.forEach((key) => {
        const errorObj = messages[key];
        errors[key] =
            ApiError.create(errorObj.status_code,
                errorObj.error_code, errorObj.description,
                errorObj.level);
    });
})();
module.exports = errors;
