const Joi = require('joi');
const _ = require('lodash');
const errors = require('../core').errors;

module.exports = {
    /**
     * Validate req.body against the passed in Joi schema.
     * Calls next() if validation passes
     * else send and INTERNAL_SERVER_ERROR (500)
     * as response with the error details
     * @param {any} schema Joi schema
     * @returns {undefined} middleware that validates req.body
     */
    validateBody(schema) {
        return function bodyValidation(req, res, next) {
            const body = req.body;
            if (!body || _.isEmpty(body)) {
                next(errors
                    .invalid_input()
                    .withDetails('Request body is empty')
                );
            }

            Joi.validate(body, schema, (error) => {
                if (error) {
                    next(errors
                        .invalid_input()
                        .withDetails(error.details));
                } else {
                    next();
                }
            });
        };
    },
};
