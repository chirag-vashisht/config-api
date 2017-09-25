const AppConfigModel = require('../models/app-config');
const errors = require('api-lib').core.errors;

module.exports = {

    /**
     * Checks for duplicate configurations and saves
     * the configuration if its namespace is unique
     * @param {any} config - the config data
     * @returns {Promise} - returns a promise
     */
    addConfiguration(config) {
        return this.getConfigByNamespace(config.namespace)
            .then((data) => {
                if (data) {
                    return Promise.reject(errors.conflict()
                        .withDetails(data));
                }
                return AppConfigModel.create({
                    _id: config.namespace,
                    description: config.description,
                    data: config.data,
                });
            }).then(result => Promise.resolve({
                /*eslint-disable */
                namespace: result._id,
                /*eslint-enable */
                description: result.description,
                data: result.data,
            }));
    },


    /**
     * Gets the all saved configurations
     * @returns {Promise} - returns a promise
     */
    getConfigurations() {
        return AppConfigModel.aggregate([
            { $project: { namespace: '$_id', description: 1, _id: 0, }, },
        ]);
    },


    /**
     *  Updates a saved configuration
     * @param {String} namespace - namespace of the application
     * @param {any} configData - configuration data
     * @returns {Promise} - returns a promise
     */
    updateConfiguration(namespace, configData) {
        return AppConfigModel.update({ _id: namespace, }, configData);
    },


    /**
     * Gets configuration by namespace
     * @param {String} namespace - namespace
     * @param {Boolean} isThrowError - (Optional) set true
     * if an error is needed to be generated if not found
     * @returns {Promise} - promise object
     */
    getConfigByNamespace(namespace, isThrowError) {
        return AppConfigModel.findById(namespace)
            .then((result) => {
                if (result) {
                    return Promise.resolve({
                        /*eslint-disable */
                        namespace: result._id,
                        /*eslint-enable */
                        description: result.description,
                        data: result.data,
                    });
                } else if (isThrowError) {
                    return Promise.reject(errors.not_found());
                }
                return Promise.resolve(null);
            });
    },


    /**
     * Deletes a configuration by its namespace
     * @param {any} namespace - namespace of the app
     * @returns {Promise} - promise object
     */
    deleteConfiguration(namespace) {
        return AppConfigModel.remove({ _id: namespace, });
    },
};
