const _ = require('lodash');
const tv4 = require('tv4');
const mongoose = require('mongoose');
const NodeGeocoder = require('node-geocoder');
const moment = require('moment');

const geocoder = NodeGeocoder({});

const appUtils = {};
module.exports = appUtils;

/**
 * Numeric characters string: 0-9.
 * @type {string}
 */
appUtils.NUMERIC = '0123456789';


/**
 * Generate a string of given length of random numeric digits.
 * @param {Number} length - desired output length. Must be > 0;
 * @return {string} generated output string.
 */
appUtils.randomNumeric = function (length) {
    if (!_.isNumber(length) || length < 1) {
        throw new Error("length should be a non zero number.");
    }

    var random = [];
    (function () {
        for (var i = 0; i < length; i++) {
            random.push(appUtils.NUMERIC[_.random(0, appUtils.NUMERIC.length - 1)]);
        }
    })();


    return random.join("");
};

/**
 * Returns a tv4 validation result for given schema and data.
 * Returned result.valid will be true if validation passes.
 * If result.valid is not true, result is validation failure error.
 * @Param {Object} schema = tv4 schema
 * @Param {*} data = data to validate
 */
appUtils.validateData = function (schema, data) {
    // make validation
    var result = tv4.validateResult(data, schema, false, false);
    _.unset(result, 'error.stack');
    _.unset(result, 'error.schemaPath');
    return result;
};

/**
 * Transform list to paginated response.
 * @param {Array} results - results of fetched record.
 * @param {Number} skip - number of skipped item.
 * @param {Number} limit - number of limit.
 * @return {Object} paginated data
 */
appUtils.transformResultsToPaginated = function (results, skip, limit) {

    // result object
    var resObj = {
        skip: _.isFinite(skip) ? skip : 0,
        limit: _.isFinite(limit) ? limit : 25,
        items: results,
        hasPrev: skip > 0,
        hasNext: false
    };

    if (_.isArray(results) && results.length > limit) {
        // more result are available.
        if (results.length > limit + skip) {
            resObj.hasNext = true;
        }
        resObj.items = results.slice(skip, limit + skip);

    }

    resObj.item_count = resObj.items.length;

    return resObj;
};


/**
 * convert array of string ids to array of object ids
 * @params {Array} - array of string ids
 * @return {Array} array of object ids
 */
appUtils.convertStringIdsToObjectIds = function (ids) {
    return _.map(ids, function (id) {
        return new mongoose.Types.ObjectId(id);
    });
};

/**
 * convert a string id to object id
 * @params {string} - string id
 * @return {ObjectId} - object id
 */
appUtils.convertStringIdToObjectId = function (id) {
    return new mongoose.Types.ObjectId(id);
};


/**
 * create comparison method on array of objects
 * @params {string} - string propertyName on which sorting to apply.
 * @return {function} - function
 */
appUtils.createComparisonFunction = function (propertyName) {
    return function (object1, object2) {
        var value1 = JSON.parse(JSON.stringify(object1))[propertyName];
        var value2 = JSON.parse(JSON.stringify(object2))[propertyName];
        if (value1 < value2) {
            return -1;
        } else if (value1 > value2) {
            return 1;
        } else {
            return 0;
        }
    };
};

/**
 * create update query for partially update an object
 * @param {String} partialObjectName - object name to be updated
 * @param {Object} data - data to partially update an object
 * @return {Object} - update query
 */
appUtils.buildUpdateObjectQuery = function (partialObjectName, data) {
    var output = {};
    Object.keys(data).forEach(function (key) {
        output[partialObjectName + '.' + key] = data[key];
    });
    return output;
};

/**
 * get lat and long using given address and pincode.
 * @param {String} address - address
 * @param {String} country - country
 * @param {String} pinCode - pinCode
 * @return {Object} - promise Object.
 */
appUtils.geoCodeAddress = function (address, country, pinCode) {
    return new Promise(function (resolve, reject) {
        geocoder.geocode({
            address: address,
            country: country,
            zipcode: pinCode
        }, function (err, res) {
            if (err || res && res.length === 0) {
                return reject(err);
            }
            resolve([res[0].longitude, res[0].latitude]);
        });
    });
};

appUtils.getUTCTimestamp = function () {
    return moment.utc().valueOf();
}

appUtils.createPushObject = function (ids, eventCode, payload) {
    var obj = {
        push: {
            ids: ids,
            event_code: eventCode,
            payload: payload
        }
    }
    return obj;
}
