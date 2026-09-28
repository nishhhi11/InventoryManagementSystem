import { useEffect, useState } from "react";
import { getProducts, updateStock } from "../services/api";

function Inventory() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [stock, setStock] = useState("");
    const [reason, setReason] = useState("Manual Adjustment");
    const [error, setError] = useState("");

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

    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <p className="eyebrow">INVENTORY</p>
                    <h1>Products</h1>
                </div>

                <input
                    className="search-input"
                    placeholder="Search products or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {error && <div className="error-box">{error}</div>}

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
