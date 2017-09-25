module.exports = {
    //--------------------- GENERIC ERRORS -------------------------/
    internal_error: {
        status_code: 500,
        error_code: 'INTERNAL_ERROR',
        description: 'Something went wrong on server. Please contact server admin.'
    },
    invalid_key: {
        status_code: 401,
        error_code: 'INVALID_KEY',
        description: 'Valid api key is required. Please provide a valid api key along with request.'
    },
    invalid_auth: {
        status_code: 401,
        error_code: 'INVALID_AUTH',
        description: 'Valid auth token is required. Please provide a valid auth token along with request.'
    },
    invalid_permission: {
        status_code: 401,
        error_code: 'INVALID_PERMISSION',
        description: 'Permission denied. Current user does not has required permissions for this resource.'
    },
    invalid_access: {
        status_code: 401,
        error_code: 'INVALID_ACCESS',
        description: 'Access denied. Current user does not has access for this resource.'
    },
    invalid_input: {
        status_code: 400,
        error_code: 'INVALID_INPUT',
        description: 'The request input is not as expected by API. Please provide valid input.'
    },
    input_too_large: {
        status_code: 400,
        error_code: 'INPUT_TOO_LARGE',
        description: 'The request input size is larger than allowed.'
    },
    invalid_input_format: {
        status_code: 400,
        error_code: 'INVALID_INPUT_FORMAT',
        description: 'The request input format is not allowed.'
    },
    invalid_operation: {
        status_code: 403,
        error_code: 'INVALID_OPERATION',
        description: 'Requested operation is not allowed due to applied rules. Please refer to error details.'
    },
    not_found: {
        status_code: 404,
        error_code: 'NOT_FOUND',
        description: 'The resource referenced by request does not exists.'
    },
    invalid_login: {
        status_code: 401,
        error_code: 'UNAUTHORIZED',
        description: 'Login credentials do not match any registered user.'
    },
    account_disabled: {
        status_code: 403,
        error_code: 'ACCOUNT_DISABLED',
        description: 'User account has been disabled.'
    },
    parent_disabled_account: {
        status_code: 403,
        error_code: 'PARENT_DISABLED_ACCOUNT',
        description: 'User account has been disabled by parent account.'
    },
    email_already_registered: {
        status_code: 400,
        error_code: 'EMAIL_ALREADY_REGISTERED',
        description: 'A user with similar email is already registered.'
    }
};
