import { useEffect, useState } from "react";
import { createCategory, getCategories } from "../services/api";
import { Keyboard, Router, Plug, PenTool, Folder, Monitor, Cpu, Headset, Mouse } from "lucide-react";

function Categories({ user }) {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const loadCategories = async () => {
        try {
            setCategories(await getCategories());
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const addCategory = async (e) => {
        e.preventDefault();

        try {
            await createCategory({ name, description });
            setName("");
            setDescription("");
            loadCategories();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <p className="eyebrow">CATALOG</p>
                    <h1>Categories</h1>
                </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            {user.role === "Admin" && (
                <section className="panel category-form">
                    <h3>Add Category</h3>

                    <form onSubmit={addCategory}>
                        <input
                            value={name}
                            placeholder="Category name"
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <input
                            value={description}
                            placeholder="Description"
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <button className="primary-small">Add Category</button>
                    </form>
                </section>
            )}

            <section className="panel">
                <div className="category-grid">
                    {categories.map((category) => (
                        <div className="category-card" key={category._id}>
                            <div className="category-icon">▣</div>
                            <h3>{category.name}</h3>
                            <p>{category.description || "No description available"}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Categories;