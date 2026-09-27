import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Categories = () => {
    const { user } = useAuth();

    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const createCategory = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            await api.post("/categories", {
                name,
                description
            });

            setName("");
            setDescription("");
            setMessage("Category created successfully.");
            loadCategories();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Failed to create category"
            );
        }
    };

    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Organization</p>
                    <h2>Categories</h2>
                    <p>
                        Organize your products into manageable
                        groups.
                    </p>
                </div>
            </div>

            <div className="category-layout">
                <section className="panel">
                    <div className="panel-header">
                        <div>
                            <p className="eyebrow">
                                Categories
                            </p>
                            <h3>All categories</h3>
                        </div>

                        <span className="count-pill">
                            {categories.length}
                        </span>
                    </div>

                    <div className="category-list">
                        {categories.map((category) => (
                            <div
                                className="category-row"
                                key={category._id}
                            >
                                <div className="category-icon">
                                    {category.name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </div>

                                <div>
                                    <strong>
                                        {category.name}
                                    </strong>

                                    <span>
                                        {category.description ||
                                            "No description"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {user?.role === "Admin" && (
                    <section className="panel">
                        <div className="panel-header">
                            <div>
                                <p className="eyebrow">
                                    Admin
                                </p>
                                <h3>Add category</h3>
                            </div>
                        </div>

                        <form
                            className="category-form"
                            onSubmit={createCategory}
                        >
                            <label>Category Name</label>

                            <input
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="e.g. Accessories"
                                required
                            />

                            <label>Description</label>

                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                placeholder="Describe this category..."
                                rows="5"
                            />

                            {message && (
                                <div className="success-message">
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="form-error">
                                    {error}
                                </div>
                            )}

                            <button
                                className="primary-button"
                                type="submit"
                            >
                                Create Category
                            </button>
                        </form>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Categories;
