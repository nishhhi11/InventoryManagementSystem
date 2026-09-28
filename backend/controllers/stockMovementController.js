const StockMovement = require("../models/StockMovement");

const getStockMovements = async (req, res, next) => {
    try {
        const movements = await StockMovement.find()
            .populate("product", "name sku")
            .populate("performedBy", "name email role")
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(movements);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStockMovements
};
