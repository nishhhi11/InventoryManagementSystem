import { useEffect, useState } from "react";
import { createCategory, getCategories, deleteCategory } from "../services/api";
import { Folder, Trash2 } from "lucide-react";

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

    const handleDelete = async (id, catName) => {
        if (window.confirm(`Are you sure you want to delete the category "${catName}"?`)) {
            try {
                await deleteCategory(id);
                loadCategories();
            } catch (err) {
                setError(err.message);
            }
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

                {categories.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)' }}>
                            <Folder size={24} />
                        </div>
                        <h3 style={{ fontSize: '16px', color: 'var(--text-color, #dffafa)', marginBottom: '8px' }}>No categories found</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Add a category to organize your inventory.</p>
                    </div>
                ) : (
                    <div className="category-grid">
                        {categories.map((category) => (
                            <div className="category-card" key={category._id} style={{ position: 'relative' }}>
                                <div className="category-icon">▣</div>
                                <h3>{category.name}</h3>
                                <p>{category.description || "No description available"}</p>
                                {user.role === "Admin" && (
                                    <button 
                                        onClick={() => handleDelete(category._id, category.name)} 
                                        style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                        title="Delete Category"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Categories;