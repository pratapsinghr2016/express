const mongoose = require('mongoose');
require('./account');

const attachmentSchema = new mongoose.Schema({
    file_name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    bucket: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
});

const contactSchema = new mongoose.Schema(
    {
        name: String,
        first_name: String,
        last_name: String,
        email: String,
        image: {
            file_name: { type: String },
            type: { type: String },
            bucket: { type: String },
            size: { type: Number },
            key: { type: String },
        },
        address: {
            type: Object,
            of: String,
        },
        people: [mongoose.Schema.Types.ObjectId],
        businesses: [mongoose.Schema.Types.ObjectId],
        deals: [mongoose.Schema.Types.ObjectId],
        pipelines: [mongoose.Schema.Types.ObjectId],
        products: [mongoose.Schema.Types.ObjectId],
        followers: [mongoose.Schema.Types.ObjectId],
        social: {},
        owner: mongoose.Schema.Types.ObjectId,
        parent_account: mongoose.Schema.Types.ObjectId,
        created_by: mongoose.Schema.Types.ObjectId,
        visibility: String,
        attachments: [attachmentSchema],
        account: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Account',
        },
        created: Number,
        updated: Number,
        profile_logo: {
            key: String,
            url: String,
        },
        lead_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'LeadFinderLead',
        },
        currency: Object,
    },
    { strict: false },
);

contactSchema.index({ lead_id: 1 });

// contactSchema.methods.toJSON = require('./toJSON');

attachmentSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

contactSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

module.exports = mongoose.model('Contact', contactSchema, 'crm.contacts');
