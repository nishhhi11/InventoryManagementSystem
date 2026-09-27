const Product = require("../models/Product");
const Category = require("../models/Category");

const createProduct = async (req, res) => {
    try {
        const { name, description, price, stockQuantity, category } = req.body;

        if (!name || price === undefined || stockQuantity === undefined || !category) {
            return res.status(400).json({
                message: "Name, price, stock quantity and category are required"
            });
        }

        if (stockQuantity < 0) {
            return res.status(400).json({
                message: "Stock quantity cannot be negative"
            });
        }

        const categoryExists = await Category.findById(category);

        if (!categoryExists) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            stockQuantity,
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
        const filter = {};

        if (req.query.lowStock === "true") {
            filter.stockQuantity = { $lte: 10 };
        }

        const products = await Product.find(filter).populate(
            "category",
            "name"
        );

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
        const { name, description, price, stockQuantity, category } = req.body;

        if (stockQuantity !== undefined && stockQuantity < 0) {
            return res.status(400).json({
                message: "Stock quantity cannot be negative"
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
                description,
                price,
                stockQuantity,
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
        const { stockQuantity } = req.body;

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

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stockQuantity },
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
            message: "Stock updated successfully",
            product
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

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    updateStock,
    deleteProduct
};