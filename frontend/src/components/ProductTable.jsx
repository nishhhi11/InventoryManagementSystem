import { useState } from "react";

const ProductTable = ({
    products,
    onStockUpdate,
    compact = false
}) => {
    const [editingId, setEditingId] = useState(null);
    const [stockValue, setStockValue] = useState("");

    const startEdit = (product) => {
        setEditingId(product._id);
        setStockValue(product.stockQuantity);
    };

    const saveStock = async (id) => {
        const value = Number(stockValue);

        if (Number.isNaN(value) || value < 0) {
            return;
        }

        await onStockUpdate(id, value);
        setEditingId(null);
    };

    if (!products.length) {
        return (
            <div className="empty-state">
                <div className="empty-icon">□</div>
                <h3>No products found</h3>
                <p>
                    Try changing your search or filter.
                </p>
            </div>
        );
    }

    return (
        <div className={`table-wrapper ${compact ? "compact" : ""}`}>
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Reorder Level</th>
                        {!compact && <th>Action</th>}
                    </tr>
                </thead>

                <tbody>
                    {products.map((product) => {
                        const isLowStock =
                            product.stockQuantity <=
                            product.reorderLevel;

                        return (
                            <tr key={product._id}>
                                <td>
                                    <div className="product-cell">
                                        <div className="product-image">
                                            {product.name
                                                ?.charAt(0)
                                                ?.toUpperCase()}
                                        </div>

                                        <div>
                                            <strong>
                                                {product.name}
                                            </strong>
                                            <span>
                                                {product.description ||
                                                    "Inventory item"}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <span className="sku">
                                        {product.sku || "—"}
                                    </span>
                                </td>

                                <td>
                                    {product.category?.name || "—"}
                                </td>

                                <td>
                                    ₹
                                    {Number(
                                        product.price
                                    ).toLocaleString("en-IN")}
                                </td>

                                <td>
                                    {editingId === product._id ? (
                                        <div className="stock-edit">
                                            <input
                                                type="number"
                                                min="0"
                                                value={stockValue}
                                                onChange={(e) =>
                                                    setStockValue(
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <button
                                                onClick={() =>
                                                    saveStock(
                                                        product._id
                                                    )
                                                }
                                            >
                                                ✓
                                            </button>

                                            <button
                                                className="cancel-edit"
                                                onClick={() =>
                                                    setEditingId(null)
                                                }
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <span
                                            className={`stock-badge ${
                                                isLowStock
                                                    ? "low"
                                                    : "healthy"
                                            }`}
                                        >
                                            {product.stockQuantity}
                                        </span>
                                    )}
                                </td>

                                <td>
                                    {product.reorderLevel}
                                </td>

                                {!compact && (
                                    <td>
                                        {editingId !==
                                            product._id && (
                                            <button
                                                className="table-action"
                                                onClick={() =>
                                                    startEdit(
                                                        product
                                                    )
                                                }
                                            >
                                                Update
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
