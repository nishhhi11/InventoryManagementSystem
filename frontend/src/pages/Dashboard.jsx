import { useEffect, useState } from "react";
import {
    getProductStats,
    getProducts,
    getReorderProducts,
    getStockMovements
} from "../services/api";
import StatCard from "../components/StatCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Search, RefreshCw, Package, BarChart2, IndianRupee, AlertTriangle, Users, MoreVertical, Ban } from 'lucide-react';

function Dashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [reorderProducts, setReorderProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const results = await Promise.allSettled([
                getProductStats(),
                getProducts(),
                getReorderProducts(),
                getStockMovements()
            ]);

            const [statsRes, productsRes, reorderRes, movementsRes] = results;

            if (statsRes.status === "fulfilled") setStats(statsRes.value);
            else console.error("Failed to load stats:", statsRes.reason);

            if (productsRes.status === "fulfilled") setProducts(productsRes.value);
            else console.error("Failed to load products:", productsRes.reason);

            if (reorderRes.status === "fulfilled") setReorderProducts(reorderRes.value);
            else console.error("Failed to load reorder products:", reorderRes.reason);

            if (movementsRes.status === "fulfilled") setMovements(movementsRes.value);
            else console.error("Failed to load movements:", movementsRes.reason);


            setLastUpdated(new Date());
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const healthyProducts = products.filter(
        (product) =>
            product.stockQuantity > product.reorderLevel
    ).length;

    const lowStockProducts = products.filter(
        (product) =>
            product.stockQuantity > 0 &&
            product.stockQuantity <= product.reorderLevel
    ).length;

    const outOfStockProducts = products.filter(
        (product) => product.stockQuantity === 0
    ).length;

    const formatTime = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getMovementType = (movement) => {
        if (movement.quantityChanged > 0) {
            return "Stock increased";
        }

        if (movement.quantityChanged < 0) {
            return "Stock decreased";
        }

        return "Stock adjusted";
    };

    // Prepare chart data
    const categoryData = products.reduce((acc, product) => {
        const catName = product.category?.name || "Uncategorized";
        if (!acc[catName]) {
            acc[catName] = { name: catName, stock: 0, value: 0, productsCount: 0 };
        }
        acc[catName].productsCount += 1;
        acc[catName].stock += (product.stockQuantity || 0);
        acc[catName].value += ((product.stockQuantity || 0) * (product.price || 0));
        return acc;
    }, {});

    const chartData = Object.values(categoryData).sort((a, b) => b.stock - a.stock);

    const movementChartData = Object.values(
        movements.reduce((acc, mov) => {
            const dateStr = new Date(mov.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            if (!acc[dateStr]) {
                acc[dateStr] = { date: dateStr, quantity: 0 };
            }
            // Add up absolute quantity changed for total movement volume per day
            acc[dateStr].quantity += Math.abs(mov.quantityChanged || 0);
            return acc;
        }, {})
    );

    const movementStats = movements.reduce(
        (acc, mov) => {
            if (mov.quantityChanged > 0) {
                acc.increased += mov.quantityChanged;
                acc.increaseCount += 1;
            } else if (mov.quantityChanged < 0) {
                acc.decreased += Math.abs(mov.quantityChanged);
                acc.decreaseCount += 1;
            }
            return acc;
        },
        { increased: 0, decreased: 0, increaseCount: 0, decreaseCount: 0 }
    );
    if (error) {
        console.error("Dashboard error:", error);
    }

    if (error) {
        return (
            <div className="page">
                <div className="dashboard-error">
                    <strong>
                        Unable to load dashboard
                    </strong>

                    <p>{error}</p>

                    <button
                        className="refresh-button"
                        onClick={loadDashboard}
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page real-dashboard">

            {/* HEADER */}

            <header className="real-dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', color: 'var(--primary-light, #5de0d4)', textTransform: 'uppercase', margin: 0 }}>
                        Dashboard
                    </p>
                    <h1 style={{ fontSize: '24px', margin: '4px 0', fontWeight: 700 }}>
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.name}
                    </h1>
                    <p style={{ color: 'var(--text-muted, #769293)', fontSize: '14px', margin: 0 }}>
                        Here's what's happening across your inventory today.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted, #769293)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', color: '#5de0d4' }}>
                            <span style={{ width: '6px', height: '6px', backgroundColor: 'currentColor', borderRadius: '50%', display: 'inline-block', marginRight: '6px', boxShadow: '0 0 8px currentColor' }}></span>
                            Live
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Last synced {lastUpdated ? lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '—'}
                            <button onClick={loadDashboard} style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: 'inherit', display: 'flex', opacity: 0.7 }} title="Refresh">
                                <RefreshCw size={12} />
                            </button>
                        </span>
                    </div>
                </div>
            </header>


            {/* INVENTORY VALUE HERO PANEL */}
            <section style={{ 
                background: 'linear-gradient(135deg, var(--card-bg, #061d20) 0%, rgba(105, 167, 186, 0.1) 100%)', 
                borderRadius: '16px', 
                padding: '30px', 
                marginBottom: '24px', 
                border: '1px solid rgba(110, 220, 210, 0.15)', 
                position: 'relative', 
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-muted, #769293)', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
                            Inventory value
                        </p>
                        <h2 style={{ fontSize: '42px', margin: 0, fontWeight: 800, color: 'var(--text-color, #dffafa)', letterSpacing: '-1px' }}>
                            ₹{Number(stats?.inventoryValue || 0).toLocaleString("en-IN")}
                        </h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-light, #69a7ba)', margin: '0 0 12px 0' }}>
                            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-color, #dffafa)', margin: '0 0 4px 0' }}>
                            {stats?.totalProducts ?? 0} products
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-color, #dffafa)', margin: 0 }}>
                            {stats?.totalStock ?? 0} units
                        </p>
                    </div>
                </div>

                {/* Decorative Sparkline Chart */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.15, zIndex: 0 }}>
                    <svg width="100%" height="80" viewBox="0 0 1000 80" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 60 C 150 60, 250 20, 400 20 C 550 20, 650 70, 800 70 C 900 70, 950 40, 1000 40" stroke="var(--primary-light, #5de0d4)" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M0 60 C 150 60, 250 20, 400 20 C 550 20, 650 70, 800 70 C 900 70, 950 40, 1000 40 L1000 80 L0 80 Z" fill="url(#paint0_linear_hero)"/>
                        <defs>
                            <linearGradient id="paint0_linear_hero" x1="500" y1="20" x2="500" y2="80" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--primary-light, #5de0d4)" stopOpacity="0.8"/>
                                <stop offset="1" stopColor="var(--primary-light, #5de0d4)" stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </section>

            {/* COMPACT METRICS */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ padding: '20px', background: 'var(--card-bg, #061d20)', borderRadius: '12px', border: '1px solid rgba(110, 220, 210, 0.1)' }}>
                    <div style={{ color: 'var(--text-muted, #769293)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Products</div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{stats?.totalProducts ?? 0}</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--card-bg, #061d20)', borderRadius: '12px', border: '1px solid rgba(110, 220, 210, 0.1)' }}>
                    <div style={{ color: 'var(--text-muted, #769293)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Units</div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{stats?.totalStock ?? 0}</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--card-bg, #061d20)', borderRadius: '12px', border: '1px solid rgba(110, 220, 210, 0.1)' }}>
                    <div style={{ color: 'var(--text-muted, #769293)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Low stock</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger-color, #ff6b6b)' }}>{stats?.lowStockProducts ?? 0}</div>
                </div>
            </section>
            
            {/* CHARTS ROW 1 */}
            <section className="dashboard-two-column chart-layout" style={{ marginTop: '20px' }}>
                
                {/* Inventory Status (Real Donut) */}
                <div className="dashboard-section" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="section-heading no-border">
                        <div>
                            <h2>Inventory status</h2>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px' }}>
                        <div style={{ width: '100%', height: 200, position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Healthy', value: healthyProducts, color: '#4bb9a2' },
                                            { name: 'Low stock', value: lowStockProducts, color: '#e8b84d' },
                                            { name: 'Out of stock', value: outOfStockProducts, color: '#df8268' }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#4bb9a2" />
                                        <Cell fill="#e8b84d" />
                                        <Cell fill="#df8268" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center percentage label */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-color, #dffafa)' }}>
                                    {products.length > 0 ? Math.round((healthyProducts / products.length) * 100) : 0}%
                                </strong>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted, #769293)', textTransform: 'uppercase', letterSpacing: '1px' }}>Healthy</span>
                            </div>
                        </div>

                        <div className="status-list" style={{ width: '100%', marginTop: '20px', padding: '0 20px' }}>
                            <div className="status-row">
                                <div style={{ color: 'var(--text-color, #dffafa)' }}>
                                    <span className="status-marker healthy-marker" style={{ backgroundColor: '#4bb9a2' }}></span>
                                    Healthy
                                </div>
                                <strong style={{ color: 'var(--text-color, #dffafa)' }}>{healthyProducts}</strong>
                            </div>

                            <div className="status-row">
                                <div style={{ color: 'var(--text-color, #dffafa)' }}>
                                    <span className="status-marker warning-marker" style={{ backgroundColor: '#e8b84d' }}></span>
                                    Low stock
                                </div>
                                <strong style={{ color: 'var(--text-color, #dffafa)' }}>{lowStockProducts}</strong>
                            </div>

                            <div className="status-row">
                                <div style={{ color: 'var(--text-color, #dffafa)' }}>
                                    <span className="status-marker danger-marker" style={{ backgroundColor: '#df8268' }}></span>
                                    Out of stock
                                </div>
                                <strong style={{ color: 'var(--text-color, #dffafa)' }}>{outOfStockProducts}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* REORDER REQUIRED */}
                <div className="dashboard-section" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
                    <div className="section-heading" style={{ marginBottom: '16px', padding: 0 }}>
                        <div>
                            <h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600, margin: 0 }}>Reorder Required</h2>
                        </div>
                        <button
                            className="section-link"
                            onClick={() => window.dispatchEvent(new CustomEvent("open-reorder-center"))}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                        >
                            View all &rarr;
                        </button>
                    </div>

                    {reorderProducts.length === 0 ? (
                        <div className="clean-empty" style={{ background: 'var(--card-bg, #061d20)', borderRadius: '12px', padding: '30px' }}>
                            No products require restocking.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {reorderProducts.slice(0, 2).map((product) => {
                                const stockQty = Number(product.stockQuantity) || 0;
                                const reorderLvl = Number(product.reorderLevel) || 0;
                                const shortage = Math.max(0, reorderLvl - stockQty);
                                const progressPct = reorderLvl > 0 ? Math.min(100, (stockQty / reorderLvl) * 100) : 0;
                                
                                return (
                                <div key={product._id} style={{ backgroundColor: 'rgba(255, 107, 107, 0.05)', border: '1px solid rgba(255, 107, 107, 0.2)', borderRadius: '12px', padding: '24px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#ff6b6b', letterSpacing: '1px', marginBottom: '12px' }}>NEEDS ATTENTION</div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-color, #dffafa)' }}>{product.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted, #769293)', marginBottom: '16px' }}>{product.sku}</div>

                                    <div style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-color, #dffafa)' }}>
                                        <strong>{stockQty} / {reorderLvl} units</strong>
                                    </div>
                                    
                                    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 107, 107, 0.15)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                                        <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: '#ff6b6b' }}></div>
                                    </div>
                                    
                                    <div style={{ fontSize: '12px', color: '#ff6b6b', marginBottom: '20px' }}>
                                        {shortage} units below reorder level
                                    </div>
                                    
                                    <div style={{ textAlign: 'right' }}>
                                        <button onClick={() => window.dispatchEvent(new CustomEvent("open-reorder-center"))} style={{ background: 'none', border: 'none', color: 'var(--primary-light, #5de0d4)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '13px' }}>
                                            Update stock →
                                        </button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </section>




            {/* PRODUCTS */}

            <section className="dashboard-section products-section" style={{ background: 'transparent', border: 'none', padding: 0 }}>

                <div className="section-heading" style={{ borderBottom: 'none', marginBottom: '16px', paddingBottom: 0 }}>
                    <div>
                        <h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600, margin: 0 }}>Products</h2>
                    </div>
                    <button
                        className="section-link"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-inventory"))}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                    >
                        View inventory &rarr;
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {products.slice(0, 5).map((product) => {
                        const isOut = product.stockQuantity === 0;
                        const isLow = !isOut && product.stockQuantity <= product.reorderLevel;
                        const status = isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK" : "IN STOCK";
                        const statusColor = isOut ? "#df8268" : isLow ? "#e8b84d" : "#4bb9a2";

                        return (
                            <div
                                key={product._id}
                                style={{
                                    backgroundColor: 'var(--card-bg, #ffffff)',
                                    border: '1px solid rgba(93, 224, 212, 0.15)',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: '42px', height: '42px', 
                                        borderRadius: '8px', 
                                        backgroundColor: 'rgba(93, 224, 212, 0.1)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontSize: '18px', fontWeight: 700, color: 'var(--primary-light, #5de0d4)' 
                                    }}>
                                        {product.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-color, #dffafa)' }}>
                                            {product.name}
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted, #769293)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>{product.sku}</span>
                                            <span style={{ opacity: 0.5 }}>·</span>
                                            <span>{product.category?.name || "—"}</span>
                                            <span style={{ opacity: 0.5 }}>·</span>
                                            <span style={{ fontWeight: 600, color: 'var(--text-color, #dffafa)' }}>₹{Number(product.price).toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-color, #dffafa)' }}>
                                        {product.stockQuantity} units
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        letterSpacing: '1px',
                                        color: statusColor,
                                        padding: '4px 8px',
                                        backgroundColor: `${statusColor}15`,
                                        borderRadius: '4px'
                                    }}>
                                        {status}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </section>


            {/* STOCK ACTIVITY */}

            <section className="dashboard-section activity-section" style={{ background: 'transparent', border: 'none', padding: 0, marginTop: '20px' }}>

                <div className="section-heading" style={{ borderBottom: 'none', marginBottom: '16px', paddingBottom: 0 }}>
                    <div>
                        <h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600, margin: 0 }}>Recent Activity</h2>
                    </div>
                    <button
                        className="section-link"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-history"))}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                    >
                        View history &rarr;
                    </button>
                </div>

                {movements.length === 0 ? (
                    <div className="clean-empty" style={{ background: 'var(--card-bg, #061d20)', borderRadius: '12px', padding: '30px' }}>
                        No stock movements recorded yet.
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid rgba(93, 224, 212, 0.15)', borderRadius: '12px', padding: '24px 24px 8px 24px' }}>
                        {movements.slice(0, 5).map((movement, idx, arr) => {
                            const isLast = idx === arr.length - 1;
                            const isIncrease = movement.quantityChanged > 0;
                            const changeColor = isIncrease ? '#4bb9a2' : '#ff6b6b';
                            const changePrefix = isIncrease ? '+' : '';
                            const timeStr = formatTime(movement.createdAt).replace(',', ' ·');
                            
                            return (
                                <div key={movement._id} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: changeColor, marginTop: '6px' }}></div>
                                        {!isLast && <div style={{ width: '1px', flex: 1, backgroundColor: 'rgba(93, 224, 212, 0.15)', marginTop: '8px', marginBottom: '2px' }}></div>}
                                    </div>
                                    <div style={{ flex: 1, paddingBottom: isLast ? '16px' : '16px', borderBottom: isLast ? 'none' : '1px solid rgba(93, 224, 212, 0.15)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <strong style={{ fontSize: '14px', color: 'var(--text-color, #dffafa)' }}>{movement.product?.name || "Unknown product"}</strong>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: changeColor }}>{changePrefix}{movement.quantityChanged}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted, #769293)', marginBottom: '4px' }}>
                                            {getMovementType(movement)} · {movement.reason || "Manual Adjustment"}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #668789)', opacity: 0.7 }}>
                                            {timeStr}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

        </div>
    );
}

export default Dashboard;
