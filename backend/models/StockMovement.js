const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        previousQuantity: {
            type: Number,
            required: true,
            min: 0
        },

        newQuantity: {
            type: Number,
            required: true,
            min: 0
        },

        quantityChanged: {
            type: Number,
            required: true
        },

        reason: {
            type: String,
            enum: [
                "Restock",
                "Sale",
                "Damaged",
                "Returned",
                "Manual Adjustment"
            ],
            required: true
        },

        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("StockMovement", stockMovementSchema);
