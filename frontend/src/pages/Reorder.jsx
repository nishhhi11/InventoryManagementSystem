import { useEffect, useState } from "react";
import api from "../services/api";

const Reorder = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadReorder = async () => {
        try {
            const response = await api.get(
                "/products/reorder"
            );

            setItems(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReorder();
    }, []);

    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Inventory intelligence</p>
                    <h2>Reorder Center</h2>
                    <p>
                        Products currently below their reorder
                        threshold.
                    </p>
                </div>

                <div className="reorder-total">
                    <strong>{items.length}</strong>
                    <span>Need attention</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-screen">
                    Loading recommendations...
                </div>
            ) : items.length === 0 ? (
                <div className="panel success-state large-success">
                    <div>✓</div>
                    <h3>Inventory is healthy</h3>
                    <p>
                        No products currently need to be
                        reordered.
                    </p>
                </div>
            ) : (
                <div className="reorder-cards">
                    {items.map((item) => (
                        <div
                            className="reorder-card"
                            key={item.productId}
                        >
                            <div className="reorder-card-top">
                                <div className="product-image">
                                    {item.name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </div>

                                <span className="danger-label">
                                    Low Stock
                                </span>
                            </div>

                            <h3>{item.name}</h3>

                            <p className="sku">
                                {item.sku || "No SKU"}
                            </p>

                            <div className="reorder-metrics">
                                <div>
                                    <span>Current</span>
                                    <strong>
                                        {item.currentStock}
                                    </strong>
                                </div>

                                <div>
                                    <span>Reorder Level</span>
                                    <strong>
                                        {item.reorderLevel}
                                    </strong>
                                </div>

                                <div>
                                    <span>Recommended</span>
                                    <strong className="recommend-number">
                                        +{item.recommendedQuantity}
                                    </strong>
                                </div>
                            </div>

                            <button className="primary-button full-button">
                                Create Restock Request
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reorder;
