var mongoose = require('mongoose');
var _ = require('lodash');


var emailRegexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var urlRegex = /^[\w]{3,5}:\/\/(([\d\w][-\d\w]{0,253}[\d\w]\.?)+|(([\d]{1,3}\.){3}[\d]{1,3}))((:([0-9]{2,4}))?)(\/?)((\/[^\\\/]+\/?)*)$/;

/**
 * Extra formats for tv4 JSON schema validator.
 */
module.exports = {
    'email': function (data) {
        var valid = _.isString(data) && emailRegexp.test(data);
        return valid ? null : 'Should be an email address.';
    },

    'date': function (data) {
        var valid = (_.isFinite(data) || _.isString(data) || _.isDate(data));
        valid = valid && new Date(parseInt(data)).toString() !== 'Invalid Date';
        return valid ? null : 'Should be a date.';
    },

    'objectId': function (data) {
        return mongoose.Types.ObjectId.isValid(data) ? null : 'Should be an object id.';
    },

    'nonEmptyOrBlank': function (data) {
        return (data.length > 0 && !/^\s+$/.test(data)) ? null : 'Should not be empty or blank.';
    },

    'mobileNumber': function (data) {
        return /^(\+?\d{1,3})?(\d){10}$/.test(data) ? null : 'Should be a mobile number.';
    },

    'numberString': function (data) {
        return !isNaN(data) ? null : 'Should be a convertible number';
    },

    'booleanString': function (data) {
        return data === 'true' || data === "false" ? null : 'Should be a convertible boolean';
    },

    'website': function (data) {
        return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(data) ? null : 'Should be a valid web url.'
    },

    'nonEmptyArray': function (data) {
        return data.length > 0 ? null : 'Expecting atleast one item in the array.';
    },

    'uri': function (data) {
        var valid = _.isString(data) && urlRegex.test(data);
        return valid ? null : 'Should be an uri.';
    },

    'uniqueItems': (array) => {
        if (array.length === new Set(array).size) {
            return null;
        } else {
            return "Duplicate item is not allowed";
        }
    },

    'nonEmptyString': (data) => {
        if (data && _.isString(data)) {
            data = data.trim().length;
            if (data.length > 0) {
                return null;
            }
        }
        return 'Empty string is not allowed.';
    },
}
