const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
 * Mongoose model for app configuration document
 */
const appConfigSchema = new Schema({
    _id: { type: String, required: true, },
    description: { type: String, required: true, },
    data: { type: Schema.Types.Mixed, required: true, },
}, { timestamps: true, _id: false, });

module.exports = mongoose.model('AppConfig', appConfigSchema, 'AppConfig');
