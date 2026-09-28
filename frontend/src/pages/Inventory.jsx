import { useEffect, useState } from "react";
import { getProducts, updateStock, getCategories, createProduct } from "../services/api";

function Inventory() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [stock, setStock] = useState("");
    const [reason, setReason] = useState("Manual Adjustment");
    const [error, setError] = useState("");

    const [categories, setCategories] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "", sku: "", price: "", stockQuantity: "", reorderLevel: "", category: "", description: ""
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
                if (data.length > 0) {
                    setNewProduct(prev => ({ ...prev, category: data[0]._id }));
                }
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);

            const query = search
                ? `?search=${encodeURIComponent(search)}`
                : "";

            const data = await getProducts(query);

            setProducts(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(loadProducts, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const saveStock = async (product) => {
        try {
            await updateStock(product._id, Number(stock), reason);

            setEditing(null);
            setStock("");

            await loadProducts();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            setAdding(true);
            setError("");
            await createProduct({
                name: newProduct.name,
                sku: newProduct.sku,
                price: Number(newProduct.price),
                stockQuantity: Number(newProduct.stockQuantity),
                reorderLevel: Number(newProduct.reorderLevel),
                category: newProduct.category,
                description: newProduct.description
            });
            setShowAddForm(false);
            setNewProduct({ name: "", sku: "", price: "", stockQuantity: "", reorderLevel: "", category: categories.length > 0 ? categories[0]._id : "", description: "" });
            await loadProducts();
        } catch (err) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <p className="eyebrow">INVENTORY</p>
                    <h1>Products</h1>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <input
                        className="search-input"
                        placeholder="Search products or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '250px' }}
                    />
                    <button className="primary-btn" onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? "Cancel" : "+ Add Product"}
                    </button>
                </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            {showAddForm && (
                <section className="panel" style={{ marginBottom: '24px', backgroundColor: 'var(--card-bg, #061d20)', padding: '24px', borderRadius: '12px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-color, #dffafa)' }}>Add New Product</h3>
                    <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted, #769293)' }}>Product Name *</label>
                            <input required className="search-input" style={{ width: '100%' }} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted, #769293)' }}>SKU *</label>
                            <input required className="search-input" style={{ width: '100%' }} value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted, #769293)' }}>Price (₹) *</label>
                            <input required type="number" min="0" step="0.01" className="search-input" style={{ width: '100%' }} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted, #769293)' }}>Category *</label>
                            <select required className="search-input" style={{ width: '100%', height: '42px' }} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                <option value="" disabled>Select category</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted, #769293)' }}>Initial Stock Quantity *</label>
                            <input required type="number" min="0" className="search-input" style={{ width: '100%' }} value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted, #769293)' }}>Reorder Level *</label>
                            <input required type="number" min="0" className="search-input" style={{ width: '100%' }} value={newProduct.reorderLevel} onChange={e => setNewProduct({...newProduct, reorderLevel: e.target.value})} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted, #769293)' }}>Description</label>
                            <textarea className="search-input" style={{ width: '100%', minHeight: '80px', padding: '12px' }} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button type="submit" className="primary-btn" disabled={adding}>
                                {adding ? "Adding..." : "Add Product"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="panel">
                {loading ? (
                    <div className="loading">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <h3>No products found</h3>
                        <p>Try a different search.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <strong>{product.name}</strong>
                                        </td>

                                        <td>
                                            {product.sku || "—"}
                                        </td>

                                        <td>
                                            {product.category?.name || "—"}
                                        </td>

                                        <td>
                                            ₹{Number(product.price).toLocaleString("en-IN")}
                                        </td>

                                        <td>
                                            {editing === product._id ? (
                                                <input
                                                    className="small-input"
                                                    type="number"
                                                    min="0"
                                                    value={stock}
                                                    onChange={(e) =>
                                                        setStock(e.target.value)
                                                    }
                                                />
                                            ) : (
                                                product.stockQuantity
                                            )}
                                        </td>

                                        <td>
                                            {product.stockQuantity <=
                                            product.reorderLevel ? (
                                                <span className="status low">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="status good">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            {editing === product._id ? (
                                                <div className="action-group">
                                                    <select
                                                        value={reason}
                                                        onChange={(e) =>
                                                            setReason(e.target.value)
                                                        }
                                                    >
                                                        <option>Restock</option>
                                                        <option>Sale</option>
                                                        <option>Damaged</option>
                                                        <option>Returned</option>
                                                        <option>
                                                            Manual Adjustment
                                                        </option>
                                                    </select>

                                                    <button
                                                        className="primary-small"
                                                        onClick={() =>
                                                            saveStock(product)
                                                        }
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="secondary-small"
                                                    onClick={() => {
                                                        setEditing(product._id);
                                                        setStock(
                                                            product.stockQuantity
                                                        );
                                                    }}
                                                >
                                                    Update Stock
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Inventory;