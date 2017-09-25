
module.export = {

    /**
     * Checks for duplicate items in array
     * @param {any} array - array
     * @returns {String?} - returns error string or null
     */
    checkDuplicateItems(array) {
        if (array.length === new Set(array).size) { return null; }
        return 'Duplicate item is not allowed';
    },
};
