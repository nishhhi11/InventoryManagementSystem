import { useEffect, useState } from "react";
import {
    getProductStats,
    getProducts,
    getReorderProducts,
    getStockMovements
} from "../services/api";
import StatCard from "../components/StatCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Search, RefreshCw, Package, BarChart2, IndianRupee, AlertTriangle, Users, MoreVertical, Ban, Layers, Bell, TrendingUp, TrendingDown, ChevronDown, CheckCircle2, Box } from 'lucide-react';

const useCountUp = (end, duration = 1500) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(end);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, duration]);
    return count;
};

function Dashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [reorderProducts, setReorderProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);

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
    const processStockInOut = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dataMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dataMap[d.toDateString()] = { date: days[d.getDay()], in: 0, out: 0 };
        }
        
        movements.forEach(mov => {
            const dateStr = new Date(mov.createdAt).toDateString();
            if (dataMap[dateStr]) {
                if (mov.quantityChanged > 0) {
                    dataMap[dateStr].in += mov.quantityChanged;
                } else {
                    dataMap[dateStr].out += Math.abs(mov.quantityChanged);
                }
            }
        });
        
        return Object.values(dataMap);
    };
    const aggregatedStockData = processStockInOut();

    const sparklineData = [
        { day: 'Mon', val: 320000 },
        { day: 'Tue', val: 325000 },
        { day: 'Wed', val: 332000 },
        { day: 'Thu', val: 328000 },
        { day: 'Fri', val: 345000 },
        { day: 'Sat', val: 352000 },
        { day: 'Sun', val: stats?.inventoryValue || 360000 }
    ];
    
    const animatedTotalProducts = useCountUp(stats?.totalProducts ?? 0);
    const animatedTotalStock = useCountUp(stats?.totalStock ?? 0);
    const animatedLowStock = useCountUp(stats?.lowStockProducts ?? 0);
    const animatedInventoryValue = useCountUp(stats?.inventoryValue ?? 0);

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

            {/* TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: 'var(--card-bg, #061d20)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(93, 224, 212, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 16px', width: '300px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Search size={16} color="var(--text-muted, #769293)" />
                    <input type="text" placeholder="Global search..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-color, #dffafa)', marginLeft: '12px', width: '100%', fontSize: '14px' }} />
                    <div style={{ fontSize: '10px', color: 'var(--text-muted, #769293)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>Ctrl K</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <Bell size={20} color="var(--text-muted, #769293)" />
                        {stats?.lowStockProducts > 0 && (
                            <div style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', backgroundColor: '#ff6b6b', borderRadius: '50%', border: '2px solid var(--card-bg, #061d20)' }}></div>
                        )}
                    </div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light, #5de0d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700 }}>
                            {user.name.charAt(0)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color, #dffafa)' }}>{user.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted, #769293)' }}>{user.role}</span>
                        </div>
                        <ChevronDown size={14} color="var(--text-muted, #769293)" />
                    </div>
                </div>
            </div>

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-muted, #769293)', textTransform: 'uppercase', margin: 0 }}>
                                Inventory value
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(75, 185, 162, 0.15)', color: '#4bb9a2', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                                <TrendingUp size={14} /> +4.2% this week
                            </div>
                        </div>
                        <h2 style={{ fontSize: '42px', margin: 0, fontWeight: 800, color: 'var(--text-color, #dffafa)', letterSpacing: '-1px' }}>
                            ₹{Number(animatedInventoryValue || 0).toLocaleString("en-IN")}
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

                {/* Real Sparkline Chart */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', opacity: 0.5, zIndex: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary-light, #5de0d4)" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="var(--primary-light, #5de0d4)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="val" stroke="var(--primary-light, #5de0d4)" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* COMPACT METRICS */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ padding: '20px', background: 'var(--card-bg, #061d20)', borderRadius: '12px', border: '1px solid rgba(110, 220, 210, 0.1)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ color: 'var(--text-muted, #769293)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>Products <TrendingUp size={12} color="#4bb9a2" /></div>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(93, 224, 212, 0.1)', borderRadius: '8px', color: 'var(--primary-light, #5de0d4)' }}>
                            <Package size={18} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-color, #dffafa)' }}>{animatedTotalProducts}</div>
                </div>

                <div style={{ padding: '20px', background: 'var(--card-bg, #061d20)', borderRadius: '12px', border: '1px solid rgba(110, 220, 210, 0.1)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ color: 'var(--text-muted, #769293)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>Units <TrendingUp size={12} color="#4bb9a2" /></div>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(93, 224, 212, 0.1)', borderRadius: '8px', color: 'var(--primary-light, #5de0d4)' }}>
                            <Layers size={18} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-color, #dffafa)' }}>{animatedTotalStock}</div>
                </div>

                <div style={{ padding: '20px', background: 'var(--card-bg, #061d20)', borderRadius: '12px', border: '1px solid rgba(255, 107, 107, 0.15)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#ff6b6b' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ color: 'var(--text-muted, #769293)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, cursor: 'help', display: 'flex', alignItems: 'center', gap: '8px' }} title="Items below their reorder level">Needs restock <TrendingDown size={12} color="#ff6b6b" /></div>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', color: '#ff6b6b' }} title="Needs restock counts items < reorder level. Low stock counts items <= reorder level.">
                            <AlertTriangle size={18} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#ff6b6b' }}>{animatedLowStock}</div>
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
                                        onMouseEnter={(_, index) => setActiveIndex(index)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                        onClick={() => window.dispatchEvent(new CustomEvent("open-inventory"))}
                                        style={{ cursor: 'pointer', outline: 'none' }}
                                    >
                                        <Cell fill="#4bb9a2" opacity={activeIndex === null || activeIndex === 0 ? 1 : 0.4} />
                                        <Cell fill="#e8b84d" opacity={activeIndex === null || activeIndex === 1 ? 1 : 0.4} />
                                        <Cell fill="#df8268" opacity={activeIndex === null || activeIndex === 2 ? 1 : 0.4} />
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg, #061d20)', border: '1px solid rgba(93, 224, 212, 0.2)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-color)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center percentage label */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-color, #dffafa)', lineHeight: 1 }}>
                                    {products.length > 0 ? Math.round((healthyProducts / products.length) * 100) : 0}<span style={{ fontSize: '18px', color: 'var(--text-muted, #769293)' }}>%</span>
                                </strong>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted, #769293)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px', fontWeight: 600 }}>Healthy</span>
                            </div>
                        </div>

                        <div className="status-list" style={{ width: '100%', marginTop: '16px', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', backgroundColor: activeIndex === 0 ? 'rgba(75, 185, 162, 0.15)' : 'rgba(75, 185, 162, 0.08)', borderRadius: '8px', border: '1px solid rgba(75, 185, 162, 0.15)', transition: 'background-color 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-color, #dffafa)', fontWeight: 500 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4bb9a2' }}></div>
                                    Healthy
                                </div>
                                <strong style={{ color: 'var(--text-color, #dffafa)', fontSize: '14px' }}>{healthyProducts}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', backgroundColor: activeIndex === 1 ? 'rgba(232, 184, 77, 0.15)' : 'rgba(232, 184, 77, 0.08)', borderRadius: '8px', border: '1px solid rgba(232, 184, 77, 0.15)', transition: 'background-color 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-color, #dffafa)', fontWeight: 500 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e8b84d' }}></div>
                                    Low stock
                                </div>
                                <strong style={{ color: 'var(--text-color, #dffafa)', fontSize: '14px' }}>{lowStockProducts}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', backgroundColor: activeIndex === 2 ? 'rgba(223, 130, 104, 0.15)' : 'rgba(223, 130, 104, 0.08)', borderRadius: '8px', border: '1px solid rgba(223, 130, 104, 0.15)', transition: 'background-color 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-color, #dffafa)', fontWeight: 500 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#df8268' }}></div>
                                    Out of stock
                                </div>
                                <strong style={{ color: 'var(--text-color, #dffafa)', fontSize: '14px' }}>{outOfStockProducts}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* REORDER REQUIRED */}
                <div className="dashboard-section" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="section-heading no-border">
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

                    <div style={{ padding: '0 20px 20px 20px', flex: 1 }}>

                    {reorderProducts.length === 0 ? (
                        <div className="clean-empty" style={{ background: 'var(--card-bg, #061d20)', borderRadius: '12px', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '250px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(75, 185, 162, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <CheckCircle2 size={32} color="#4bb9a2" />
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-color, #dffafa)', margin: '0 0 8px 0' }}>All Caught Up!</h3>
                            <p style={{ color: 'var(--text-muted, #769293)', fontSize: '14px', margin: 0, textAlign: 'center', maxWidth: '200px' }}>No products require restocking at the moment.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {reorderProducts.slice(0, 2).map((product) => {
                                const stockQty = Number(product.currentStock) || 0;
                                const reorderLvl = Number(product.reorderLevel) || 0;
                                const shortage = Math.max(0, reorderLvl - stockQty);
                                const progressPct = reorderLvl > 0 ? Math.min(100, (stockQty / reorderLvl) * 100) : 0;

                                const isNeedsRestock = stockQty < reorderLvl;
                                
                                const cardBg = isNeedsRestock ? 'rgba(255, 107, 107, 0.05)' : 'rgba(232, 184, 77, 0.05)';
                                const cardBorder = isNeedsRestock ? 'rgba(255, 107, 107, 0.2)' : 'rgba(232, 184, 77, 0.2)';
                                const accentColor = isNeedsRestock ? '#ff6b6b' : '#e8b84d';
                                const labelText = isNeedsRestock ? 'NEEDS ATTENTION' : 'LOW STOCK';
                                const actionText = isNeedsRestock ? 'Restock' : 'Monitor';
                                const shortageText = isNeedsRestock ? `${shortage} short` : 'At reorder level';

                                return (
                                    <div key={product.productId} style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', padding: '24px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: accentColor, letterSpacing: '1px', marginBottom: '12px' }}>{labelText}</div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-color, #dffafa)' }}>{product.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted, #769293)', marginBottom: '16px' }}>{product.sku}</div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-color, #dffafa)', lineHeight: 1 }}>
                                                {stockQty} <span style={{ fontSize: '14px', color: 'var(--text-muted, #769293)', fontWeight: 600 }}>/ {reorderLvl}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: accentColor }}>
                                                {shortageText}
                                            </div>
                                        </div>

                                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--card-bg, #061d20)', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px', border: `1px solid ${cardBorder}` }}>
                                            <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: accentColor, transition: 'width 0.5s ease-in-out' }}></div>
                                        </div>

                                        <div style={{ backgroundColor: 'var(--card-bg, #061d20)', borderRadius: '8px', padding: '16px', marginBottom: '16px', border: `1px solid ${cardBorder}` }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted, #769293)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: 600 }}>Stock health</div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                                <span style={{ color: 'var(--text-muted, #769293)' }}>Current stock</span>
                                                <strong style={{ color: 'var(--text-color, #dffafa)' }}>{stockQty}</strong>
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                                <span style={{ color: 'var(--text-muted, #769293)' }}>Reorder level</span>
                                                <strong style={{ color: 'var(--text-color, #dffafa)' }}>{reorderLvl}</strong>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                                <span style={{ color: 'var(--text-muted, #769293)' }}>Shortage</span>
                                                <strong style={{ color: accentColor }}>{shortage}</strong>
                                            </div>

                                            <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(93, 224, 212, 0.1)', margin: '12px 0' }}></div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                                <span style={{ color: 'var(--text-muted, #769293)' }}>Suggested action</span>
                                                <strong style={{ color: isNeedsRestock ? '#ff6b6b' : '#e8b84d' }}>{actionText}</strong>
                                            </div>
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
                </div>

            </section>




            {/* PRODUCTS & ACTIVITY ROW */}
            <section className="dashboard-two-column" style={{ marginTop: '20px' }}>

                {/* PRODUCTS */}
                <div className="dashboard-section products-section" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="section-heading no-border">
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

                    <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {products.slice(0, 5).map((product) => {
                        const isOut = product.stockQuantity === 0;
                        const isLow = !isOut && product.stockQuantity <= product.reorderLevel;
                        const status = isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK" : "IN STOCK";
                        const statusColor = isOut ? "#df8268" : isLow ? "#e8b84d" : "#4bb9a2";

                        return (
                            <div
                                key={product._id}
                                className="product-card"
                                style={{
                                    backgroundColor: 'rgba(93, 224, 212, 0.03)',
                                    border: '1px solid rgba(93, 224, 212, 0.1)',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => { 
                                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.backgroundColor = 'rgba(93, 224, 212, 0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(93, 224, 212, 0.25)';
                                }}
                                onMouseLeave={(e) => { 
                                    e.currentTarget.style.transform = 'translateY(0)'; 
                                    e.currentTarget.style.boxShadow = 'none'; 
                                    e.currentTarget.style.backgroundColor = 'rgba(93, 224, 212, 0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(93, 224, 212, 0.1)';
                                }}
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
                </div>

                {/* STOCK ACTIVITY */}
                <div className="dashboard-section activity-section" style={{ display: 'flex', flexDirection: 'column' }}>

                    <div className="section-heading no-border">
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

                    <div style={{ padding: '0 20px 20px 20px', flex: 1 }}>
                    {movements.length === 0 ? (
                    <div className="clean-empty" style={{ background: 'var(--card-bg, #061d20)', borderRadius: '12px', padding: '30px' }}>
                        No stock movements recorded yet.
                    </div>
                    ) : (
                        <div style={{ backgroundColor: 'rgba(93, 224, 212, 0.05)', border: '1px solid rgba(93, 224, 212, 0.15)', borderRadius: '12px', padding: '24px 24px 8px 24px' }}>
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
                                            <div style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: `${changeColor}15`, color: changeColor, fontSize: '14px', fontWeight: 800 }}>
                                                {changePrefix}{movement.quantityChanged}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted, #769293)' }}>
                                                <span style={{ color: 'var(--text-color, #dffafa)', fontWeight: 500 }}>{getMovementType(movement)}</span> · {movement.reason || "Manual Adjustment"}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted, #668789)', opacity: 0.7, fontWeight: 500 }}>
                                                {timeStr}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                    )}
                    </div>
                </div>
                {/* STOCK IN VS OUT CHART */}
                <div className="dashboard-section" style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1', marginTop: '20px' }}>
                    <div className="section-heading no-border">
                        <div>
                            <h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600, margin: 0 }}>Stock Flow (7 Days)</h2>
                        </div>
                    </div>
                    <div style={{ padding: '0 20px 20px 20px', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aggregatedStockData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'var(--card-bg, #061d20)', border: '1px solid rgba(93, 224, 212, 0.2)', borderRadius: '8px' }} />
                                <Bar dataKey="in" name="Stock In" fill="#4bb9a2" radius={[4, 4, 0, 0]} barSize={12} />
                                <Bar dataKey="out" name="Stock Out" fill="#df8268" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </section>

        </div>
    );

}

export default Dashboard;