import { useEffect, useState } from "react";
import api from "../services/api";
import StatCard from "../components/StatCard";
import ProductTable from "../components/ProductTable";

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [reorder, setReorder] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {
        try {
            const [
                statsResponse,
                productsResponse,
                reorderResponse
            ] = await Promise.all([
                api.get("/products/stats"),
                api.get("/products"),
                api.get("/products/reorder")
            ]);

            setStats(statsResponse.data);
            setProducts(productsResponse.data);
            setReorder(reorderResponse.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="loading-screen">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="page">
            <div className="welcome-row">
                <div>
                    <p className="eyebrow">Overview</p>
                    <h2>Inventory at a glance</h2>
                    <p>
                        Keep track of products, stock levels and
                        restocking needs.
                    </p>
                </div>

                <div className="date-card">
                    <span>Today</span>
                    <strong>
                        {new Date().toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        )}
                    </strong>
                </div>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Products"
                    value={stats?.totalProducts || 0}
                    subtitle="Products in inventory"
                    icon="▦"
                />

                <StatCard
                    title="Total Stock"
                    value={stats?.totalStock || 0}
                    subtitle="Units currently available"
                    icon="▤"
                />

                <StatCard
                    title="Inventory Value"
                    value={`₹${Number(
                        stats?.inventoryValue || 0
                    ).toLocaleString("en-IN")}`}
                    subtitle="Current stock valuation"
                    icon="₹"
                />

                <StatCard
                    title="Low Stock"
                    value={stats?.lowStockProducts || 0}
                    subtitle="Products needing attention"
                    icon="!"
                    danger={
                        Number(
                            stats?.lowStockProducts || 0
                        ) > 0
                    }
                />
            </div>

            <div className="dashboard-grid">
                <section className="panel large-panel">
                    <div className="panel-header">
                        <div>
                            <p className="eyebrow">
                                Inventory
                            </p>
                            <h3>Recent products</h3>
                        </div>

                        <a href="/inventory">
                            View all
                        </a>
                    </div>

                    <ProductTable
                        products={products.slice(0, 5)}
                        compact
                        onStockUpdate={() => {}}
                    />
                </section>

                <section className="panel reorder-panel">
                    <div className="panel-header">
                        <div>
                            <p className="eyebrow">
                                Attention
                            </p>
                            <h3>Restock needed</h3>
                        </div>
                    </div>

                    {reorder.length === 0 ? (
                        <div className="success-state">
                            <div>✓</div>
                            <strong>Everything looks good</strong>
                            <span>
                                No products currently need
                                restocking.
                            </span>
                        </div>
                    ) : (
                        <div className="reorder-list">
                            {reorder.slice(0, 5).map((item) => (
                                <div
                                    className="reorder-item"
                                    key={item.productId}
                                >
                                    <div>
                                        <strong>
                                            {item.name}
                                        </strong>
                                        <span>
                                            {item.currentStock}{" "}
                                            units left
                                        </span>
                                    </div>

                                    <div className="reorder-number">
                                        +{item.recommendedQuantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <section className="dashboard-bottom-grid">
                <div className="panel category-summary">
                    <div className="panel-header">
                        <div>
                            <p className="eyebrow">
                                Categories
                            </p>
                            <h3>Category overview</h3>
                        </div>
                    </div>

                    <div className="category-number">
                        {stats?.totalCategories || 0}
                    </div>

                    <span>
                        Active product categories
                    </span>
                </div>

                <div className="panel insight-panel">
                    <div className="insight-icon">✦</div>
                    <div>
                        <p className="eyebrow">
                            Inventory insight
                        </p>
                        <h3>
                            Your inventory intelligence is
                            active.
                        </h3>
                        <p>
                            Stock levels, reorder thresholds and
                            inventory value are calculated
                            automatically from your database.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
