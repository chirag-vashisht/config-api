/**
 * Api response wrapper when sending Ok responses
 * @param {any} statusCode Http status code
 * @param {any} data Data to be sent as response
 * @returns {undefined}
 */
function ApiResponse(statusCode, data) {
    this.statusCode = statusCode;
    this.data = data;
}

module.exports = ApiResponse;
