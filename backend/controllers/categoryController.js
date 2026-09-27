const Category = require("../models/Category");

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        const category = await Category.create({
            name,
            description
        });

        res.status(201).json({
            message: "Category created successfully",
            category
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create category",
            error: error.message
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch categories",
            error: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json({
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update category",
            error: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json({
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete category",
            error: error.message
        });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};