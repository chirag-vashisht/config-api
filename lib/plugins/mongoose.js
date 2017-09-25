const _ = require('lodash');

/**
 * Mongoose Plugin to add a static method "findPaginate()" to schema's Model.
 */
module.exports = {

    /**
     * Model static function for paginated version of Model.find().
     * Promise result is an object like:
     * {skip:20, limit:10, total_count:100,
     * hasPrev, hasNext, items:[{},{}], item_count: 2}
     * Also, items array in results contains "toJSON()"
     * result of each document found and not the document itself.
     * @param {Object} conditions - query conditions.
     * Example: { age: { $gt: 20 } }
     * @param {Object} [options] - query options.
     * Example: {skip: 20, limit: 10, sort: { name: 1, age: -1 },
     * populate: [{path:'collection name', select:'name address'},
     * {path:'user', select:'firstName'}]}
     * @param {function} callback (optional)
     * @returns {Object} - paginated records
     */
    findPaginate(conditions, options, callback) {
        // Model class = this
        /*eslint-disable */
        const Model = this;
        /*eslint-enable */


        // save fields to un-select ,
        // as they are marked with "select:false" in schema
        const omitFields = [];
        Model.schema.eachPath((p) => {
            if (_.get(Model.schema.path(p), 'options.select', true) === false) {
                omitFields.push(p);
            }
        });

        // conditions object is required
        if (!_.isPlainObject(conditions)) {
            throw new Error('conditions must be a plain object.');
        }

        // get skip, limit and sort data
        const skip = _.isFinite(options.skip) ? Math.max(0, options.skip) : 0;
        const limit = _.isFinite(options.limit) ? options.limit : 100;
        const populate = _.isArray(options.populate) ? options.populate : [];
        const sort = _.isPlainObject(options.sort) ? options.sort : null;
        const select = _.isPlainObject(options.select) ? options.select : null;

        if (sort) {
            // clean sort object to have only numerical values
            _.forOwn(sort, (val, key) => {
                if (!_.isFinite(val)) {
                    delete sort[key];
                }
            });
        }

        // process query
        let query = Model.find(conditions, select)
            .sort(sort).skip(skip).populate(populate);

        // check limit is sent or not
        if (limit) {
            query = query.limit(limit);
        }

        return query
            .exec()
            .then(cursor => Model.count(conditions)
                .then((num) => {
                    // result object
                    const result = {
                        skip,
                        limit: limit || cursor.length,
                        total_count: num,
                        items: cursor,
                        hasPrev: skip > 0,
                        hasNext: false,
                    };

                    // emulate mongoose select:false and
                    // toJSON functions for items
                    result.items = result.items.map((item) => {
                        // delete fields marked with "select:false" in schema
                        omitFields.forEach((f) => {
                            /*eslint-disable */
                            delete item[f];
                            /*eslint-enable */
                        });

                        // convert to document and transform using "toJSON()"
                        if (select == null) {
                            return (new Model(item)).toJSON();
                        }

                        return item;
                    });

                    // set item count
                    result.item_count = result.items.length;
                    result.hasNext = num > (result.item_count + skip);
                    if (callback) {
                        callback(null, result);
                    }
                    return result;
                }));
    },
};
