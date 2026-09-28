const Category = require("../models/Category");

const sendError = (res, message, error) =>
    res.status(500).json({
        message,
        error: error.message
    });

const notFound = (res) =>
    res.status(404).json({
        message: "Category not found"
    });

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        if (await Category.findOne({ name })) {
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
        sendError(res, "Failed to create category", error);
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        res.status(200).json(categories);
    } catch (error) {
        sendError(res, "Failed to fetch categories", error);
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

        if (!category) return notFound(res);

        res.status(200).json({
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        sendError(res, "Failed to update category", error);
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) return notFound(res);

        res.status(200).json({
            message: "Category deleted successfully"
        });
    } catch (error) {
        sendError(res, "Failed to delete category", error);
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};