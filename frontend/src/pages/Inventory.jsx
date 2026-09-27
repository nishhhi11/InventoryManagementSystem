import { useEffect, useState } from "react";
import api from "../services/api";
import ProductTable from "../components/ProductTable";

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [lowStock, setLowStock] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProducts = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (search) {
                params.append("search", search);
            }

            if (category) {
                params.append("category", category);
            }

            if (lowStock) {
                params.append("lowStock", "true");
            }

            const response = await api.get(
                `/products?${params.toString()}`
            );

            setProducts(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        const timer = setTimeout(() => {
            loadProducts();
        }, 250);

        return () => clearTimeout(timer);
    }, [search, category, lowStock]);

    const updateStock = async (id, stockQuantity) => {
        try {
            await api.patch(
                `/products/${id}/stock`,
                {
                    stockQuantity,
                    reason: "Manual Adjustment"
                }
            );

            await loadProducts();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Failed to update stock"
            );
        }
    };

    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Products</p>
                    <h2>Inventory</h2>
                    <p>
                        Search, filter and manage your current
                        stock.
                    </p>
                </div>

                <div className="inventory-count">
                    <strong>{products.length}</strong>
                    <span>Products shown</span>
                </div>
            </div>

            <div className="filter-panel">
                <div className="filter-search">
                    <span>⌕</span>

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search by product name or SKU..."
                    />
                </div>

                <select
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value)
                    }
                >
                    <option value="">
                        All Categories
                    </option>

                    {categories.map((item) => (
                        <option
                            value={item._id}
                            key={item._id}
                        >
                            {item.name}
                        </option>
                    ))}
                </select>

                <button
                    className={`filter-button ${
                        lowStock ? "selected" : ""
                    }`}
                    onClick={() =>
                        setLowStock(!lowStock)
                    }
                >
                    ⚠ Low Stock
                </button>

                <button
                    className="secondary-button"
                    onClick={() => {
                        setSearch("");
                        setCategory("");
                        setLowStock(false);
                    }}
                >
                    Reset
                </button>
            </div>

            <div className="panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">
                            Inventory list
                        </p>
                        <h3>All products</h3>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-box">
                        Loading products...
                    </div>
                ) : (
                    <ProductTable
                        products={products}
                        onStockUpdate={updateStock}
                    />
                )}
            </div>
        </div>
    );
};

export default Inventory;
