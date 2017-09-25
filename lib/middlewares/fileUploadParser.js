const Busboy = require('busboy');
const customError = require('../core').errors;

module.exports = {
    parseFileUploadRequest() {
        return function parseFileUploadRequest(request, response, next) {
            // Create an Busyboy instance passing the HTTP Request headers.
            try {
                const busboy = new Busboy({
                    headers: request.headers,
                });
                busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                    request.file = file;
                    request.filename = filename;
                    request.mimetype = mimetype;
                    next();
                });

                busboy.on('error', (error) => {
                    next(error);
                });

                request.pipe(busboy);
            } catch (exception) {
                next(customError
                    .invalid_input()
                    .withDetails(exception.message));
            }
        };
    },
};
