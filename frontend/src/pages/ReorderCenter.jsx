import { useEffect, useState } from "react";
import { getReorderProducts } from "../services/api";

function ReorderCenter() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReorderProducts()
            .then(setProducts)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <p className="eyebrow">ATTENTION</p>
                    <h1>Reorder Center</h1>
                </div>
            </div>

            <section className="panel">
                {loading ? (
                    <div className="loading">Checking inventory...</div>
                ) : products.length === 0 ? (
                    <div className="good-state">
                        <div className="good-icon">✓</div>
                        <h2>No restocking required</h2>
                        <p>All products are above their reorder levels.</p>
                    </div>
                ) : (
                    <div className="reorder-grid">
                        {products.map((product) => (
                            <div className="reorder-card" key={product.productId}>
                                <p className="eyebrow">NEEDS ATTENTION</p>

                                <h3>{product.name}</h3>

                                <p>{product.sku || "No SKU"}</p>

                                <div className="reorder-numbers">
                                    <div>
                                        <span>Current</span>
                                        <strong>{product.currentStock}</strong>
                                    </div>

                                    <div>
                                        <span>Reorder Level</span>
                                        <strong>
                                            {product.reorderLevel}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default ReorderCenter;