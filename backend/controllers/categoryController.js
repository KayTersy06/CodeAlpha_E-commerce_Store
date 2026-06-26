const db = require("../db");

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM categories ORDER BY category_id"
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Get category by ID
exports.getCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            "SELECT * FROM categories WHERE category_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {

        const { category_name } = req.body;

        const result = await db.query(
            `INSERT INTO categories
            (category_name)
            VALUES ($1)
            RETURNING *`,
            [category_name]
        );

        res.status(201).json({
            message: "Category created successfully",
            category: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {

        const { id } = req.params;
        const { category_name } = req.body;

        const result = await db.query(
            `UPDATE categories
             SET category_name = $1
             WHERE category_id = $2
             RETURNING *`,
            [category_name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json({
            message: "Category updated successfully",
            category: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await db.query(
            "DELETE FROM categories WHERE category_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};