const mongoose = require('mongoose');
require('./contact');
const accountSchema = new mongoose.Schema(
    {
        business: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Contact',
        },
        parent_account: mongoose.Schema.Types.ObjectId,
        referred_by: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Account',
        },
        affiliate: {
            code: String,
            clicks: Number,
        },
    },
    { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('Account', accountSchema, '_accounts');
