const Controller = require('./Controller');


/**
 * Allow a user to write the test cases for a controller layer
 * 
 * @param {any} controller - Controller object
 */
function TestController(controller) {
    if (controller instanceof Controller) {
        this.controller = controller;
    }
    else {
        throw new Error('Should be an instance of controller');
    }
}


/**
 * Executes the controller middlewares and returns
 * a callback with request response and error (if any)
 * @param {any} req - mocked request object
 * @param {any} res - mocked response object
 * @param {any} done - callback when the controller execution is done
 * @returns {undefined} - void
 */
TestController.prototype.run = function run(req, res, done) {
    var index = 0;
    var stack = this.controller.middlewares;
    if (stack.length === 0) {
        return done(req, res);
    }
    next();
    function next(err) {
        var middleware = stack[index++];
        if (!middleware) {
            return done(err, req, res);
        }
        if (err) {
            handle_error.call(middleware, err, req, res, next);
        } else {
            handle_request.call(middleware, req, res, next);
        }
    }
};

/**
 * Handle the error for the layer.
 *
 * @param {Error} error
 * @param {Request} req
 * @param {Response} res
 * @param {function} next
 * @api private
 */

function handle_error(error, req, res, next) {
    var fn = this;
    if (fn.length !== 4) {
        // not a standard error handler
        return next(error);
    }
    try {
        fn(error, req, res, next);
    } catch (err) {
        next(err);
    }
};

/**
 * Handle the request for the layer.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {function} next
 * @api private
 */
function handle_request(req, res, next) {
    var fn = this;

    if (fn.length > 3) {
        // not a standard request handler
        return next();
    }

    try {
        fn(req, res, next);
    } catch (err) {
        next(err);
    }
};
module.exports = TestController;