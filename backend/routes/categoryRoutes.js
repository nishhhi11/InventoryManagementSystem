const express = require("express");

const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getCategories);
router.post("/", protect, allowRoles("Admin"), createCategory);
router.patch("/:id", protect, allowRoles("Admin"), updateCategory);
router.delete("/:id", protect, allowRoles("Admin"), deleteCategory);

module.exports = router;