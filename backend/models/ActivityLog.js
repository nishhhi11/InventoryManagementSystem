const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            required: true
        },

        entity: {
            type: String,
            enum: ["Product", "Category", "Stock"],
            required: true
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        details: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);