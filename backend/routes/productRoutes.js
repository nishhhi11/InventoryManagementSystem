const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    updateStock,
    deleteProduct,
    getProductStats
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getProducts);

router.get("/stats", protect, getProductStats);

router.get("/:id", protect, getProductById);

router.post("/", protect, createProduct);

router.patch("/:id/stock", protect, updateStock);

router.patch("/:id", protect, updateProduct);

router.delete("/:id", protect, deleteProduct);

module.exports = router;