const express = require("express");

const { getStockMovements } = require("../controllers/stockMovementController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getStockMovements);

module.exports = router;