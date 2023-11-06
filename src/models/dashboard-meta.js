const mongoose = require('mongoose');
require('./contact');
const dashboardMetaSchema = new mongoose.Schema(
    {},
    { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('DashboardMeta', dashboardMetaSchema, '_dashboard.meta');
