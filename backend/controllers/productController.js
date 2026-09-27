const Product = require("../models/Product");
const Category = require("../models/Category");
const StockMovement = require("../models/StockMovement");
const ActivityLog = require("../models/ActivityLog");

const createProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            description,
            price,
            stockQuantity,
            reorderLevel,
            category
        } = req.body;

        if (
            !name ||
            !sku ||
            price === undefined ||
            stockQuantity === undefined ||
            !category
        ) {
            return res.status(400).json({
                message: "Name, SKU, price, stock quantity and category are required"
            });
        }

        if (stockQuantity < 0) {
            return res.status(400).json({
                message: "Stock quantity cannot be negative"
            });
        }

        if (reorderLevel !== undefined && reorderLevel < 0) {
            return res.status(400).json({
                message: "Reorder level cannot be negative"
            });
        }

        const categoryExists = await Category.findById(category);

        if (!categoryExists) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const existingSKU = await Product.findOne({ sku });

        if (existingSKU) {
            return res.status(400).json({
                message: "SKU already exists"
            });
        }

        const product = await Product.create({
            name,
            sku,
            description,
            price,
            stockQuantity,
            reorderLevel,
            category
        });

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const { search, category, lowStock } = req.query;

        const filter = {};

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        if (category) {
            const categoryExists = await Category.findOne({
                name: {
                    $regex: `^${category}$`,
                    $options: "i"
                }
            });

            if (!categoryExists) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            filter.category = categoryExists._id;
        }

        if (lowStock === "true") {
            filter.$expr = {
                $lte: ["$stockQuantity", "$reorderLevel"]
            };
        }

        const products = await Product.find(filter)
            .populate("category", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate(
            "category",
            "name"
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch product",
            error: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            description,
            price,
            stockQuantity,
            reorderLevel,
            category
        } = req.body;

        if (stockQuantity !== undefined && stockQuantity < 0) {
            return res.status(400).json({
                message: "Stock quantity cannot be negative"
            });
        }

        if (reorderLevel !== undefined && reorderLevel < 0) {
            return res.status(400).json({
                message: "Reorder level cannot be negative"
            });
        }

        if (category) {
            const categoryExists = await Category.findById(category);

            if (!categoryExists) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                sku,
                description,
                price,
                stockQuantity,
                reorderLevel,
                category
            },
            {
                new: true,
                runValidators: true
            }
        ).populate("category", "name");

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update product",
            error: error.message
        });
    }
};

const updateStock = async (req, res) => {
    try {
        const { stockQuantity, reason } = req.body;

        if (stockQuantity === undefined) {
            return res.status(400).json({
                message: "Stock quantity is required"
            });
        }

        if (stockQuantity < 0) {
            return res.status(400).json({
                message: "Stock quantity cannot be negative"
            });
        }

        if (!reason) {
            return res.status(400).json({
                message: "Stock update reason is required"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const previousQuantity = product.stockQuantity;
        const quantityChanged = stockQuantity - previousQuantity;

        product.stockQuantity = stockQuantity;

        await product.save();

        await StockMovement.create({
            product: product._id,
            previousQuantity,
            newQuantity: stockQuantity,
            quantityChanged,
            reason,
            performedBy: req.user.id
        });

        await ActivityLog.create({
            user: req.user.id,
            action: "Updated stock",
            entity: "Stock",
            entityId: product._id,
            details: `Stock changed from ${previousQuantity} to ${stockQuantity}. Reason: ${reason}`
        });

        const updatedProduct = await Product.findById(product._id).populate(
            "category",
            "name"
        );

        res.status(200).json({
            message: "Stock updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update stock",
            error: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
};

const getProductStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();

        const stockResult = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: "$stockQuantity" },
                    inventoryValue: {
                        $sum: {
                            $multiply: ["$price", "$stockQuantity"]
                        }
                    }
                }
            }
        ]);

        const lowStockProducts = await Product.countDocuments({
            $expr: {
                $lte: ["$stockQuantity", "$reorderLevel"]
            }
        });

        const totalCategories = await Category.countDocuments();

        res.status(200).json({
            totalProducts,
            totalStock: stockResult[0]?.totalStock || 0,
            lowStockProducts,
            totalCategories,
            inventoryValue: stockResult[0]?.inventoryValue || 0
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch product statistics",
            error: error.message
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    updateStock,
    deleteProduct,
    getProductStats
};