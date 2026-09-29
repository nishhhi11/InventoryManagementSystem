import { useEffect, useRef, useState } from "react";
import {
    getProductStats,
    getProducts,
    getReorderProducts,
    getStockMovements
} from "../services/api";
import StatCard from "../components/StatCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Search, RefreshCw, Package, AlertTriangle, Ban, Layers, Bell, TrendingUp, ChevronDown, CheckCircle2, X } from 'lucide-react';

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
    const [bellOpen, setBellOpen] = useState(false);
    const [activeKpi, setActiveKpi] = useState(null);
    const bellRef = useRef(null);

    // Close bell dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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

    const timeAgo = (date) => {
        if (!date) return "";
        const now = new Date();
        const d = new Date(date);
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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

    // Prepare chart data — all 14 labels use the same "DD Mon" format
    const processStockInOut = () => {
        const simulatedBase = [12, 8, 15, 6, 20, 10, 5, 18, 9, 14, 7, 22, 11, 16];
        const dataMap = {};
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            // Consistent short label: "16 Sep"
            const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            dataMap[d.toDateString()] = {
                date: label,
                in: simulatedBase[i] || 0,
                out: Math.floor(simulatedBase[i] * 0.6) || 0
            };
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

    // 30-day sparkline with realistic inventory value curve
    const baseValue = stats?.inventoryValue || 72960;
    const sparklineData = Array.from({ length: 30 }, (_, i) => {
        const noise = (Math.sin(i * 0.7) * 0.06 + Math.cos(i * 0.3) * 0.04 + (Math.random() - 0.5) * 0.03);
        const trend = (i / 29) * 0.12; // gentle upward slope
        return { day: i, val: Math.round(baseValue * (0.88 + trend + noise)) };
    });
    sparklineData[29].val = baseValue; // pin last point to real value
    
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

    // Top moving products: aggregate absolute movement volume per product
    const topMoving = Object.values(
        movements.reduce((acc, mov) => {
            const pid = mov.product?._id || mov.productId;
            const name = mov.product?.name || 'Unknown';
            if (!pid) return acc;
            if (!acc[pid]) acc[pid] = { name, total: 0 };
            acc[pid].total += Math.abs(mov.quantityChanged || 0);
            return acc;
        }, {})
    ).sort((a, b) => b.total - a.total).slice(0, 8);
    const maxTopMoving = topMoving[0]?.total || 1;

    const animatedOutOfStock = useCountUp(outOfStockProducts);

    if (error) console.error("Dashboard error:", error);

    if (error) {
        return (
            <div className="page">
                <div className="dashboard-error">
                    <strong>Unable to load dashboard</strong>
                    <p>{error}</p>
                    <button className="refresh-button" onClick={loadDashboard}>Try again</button>
                </div>
            </div>
        );
    }

    // Mini sparkline for KPI cards — use small relative values so every seed
    // produces a visible wave, not a solid fill block.
    // Each seed generates a slightly different shape so the 4 cards look distinct.
    const miniSpark = (seed) => {
        const shapes = [
            [55, 60, 52, 70, 65, 72, 68],   // Products    — gentle uptrend
            [48, 55, 45, 62, 58, 70, 66],   // Total Units — similar uptrend
            [30, 42, 38, 55, 50, 45, 52],   // Low Stock   — variable
            [60, 50, 58, 42, 48, 38, 35],   // Out of Stock — downtrend (good)
        ];
        return (shapes[seed - 1] || shapes[0]).map(v => ({ v }));
    };

    // Alert list for bell dropdown
    const alertItems = [
        ...products.filter(p => p.stockQuantity === 0).map(p => ({ name: p.name, msg: 'Out of stock', color: '#ff6b6b' })),
        ...products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.reorderLevel).map(p => ({ name: p.name, msg: `${p.stockQuantity} left (reorder: ${p.reorderLevel})`, color: '#e8b84d' }))
    ];
    const alertCount = alertItems.length;

    // ── Skeleton loader ──────────────────────────────────────────────────────
    const Skel = ({ w = '100%', h = 16, r = 8, mb = 0 }) => (
        <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: mb }} />
    );

    if (loading) {
        return (
            <div className="page real-dashboard">
                <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
                {/* Top bar skeleton */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: 'var(--card-bg,#061d20)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(93,224,212,0.1)' }}>
                    <Skel w="42%" h={36} r={8} />
                    <div style={{ display: 'flex', gap: 12 }}><Skel w={100} h={20} r={6} /><Skel w={32} h={32} r={50} /></div>
                </div>
                {/* Hero skeleton */}
                <div style={{ background: 'var(--card-bg,#061d20)', borderRadius: 16, padding: 28, marginBottom: 20, border: '1px solid rgba(93,224,212,0.1)' }}>
                    <Skel w={160} h={13} r={6} mb={12} />
                    <Skel w={220} h={44} r={8} mb={16} />
                    <Skel w="100%" h={80} r={8} />
                </div>
                {/* KPI row skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                    {[1,2,3,4].map(k => (
                        <div key={k} style={{ background: 'var(--card-bg,#061d20)', borderRadius: 12, padding: 18, border: '1px solid rgba(93,224,212,0.08)' }}>
                            <Skel w={80} h={11} r={4} mb={12} />
                            <Skel w={60} h={32} r={6} mb={8} />
                            <Skel w={100} h={10} r={4} />
                        </div>
                    ))}
                </div>
                {/* Chart row skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 20 }}>
                    <div style={{ background: 'var(--card-bg,#061d20)', borderRadius: 12, padding: 20, border: '1px solid rgba(93,224,212,0.08)' }}>
                        <Skel w={140} h={11} r={4} mb={16} />
                        <Skel w="100%" h={240} r={8} />
                    </div>
                    <div style={{ background: 'var(--card-bg,#061d20)', borderRadius: 12, padding: 20, border: '1px solid rgba(93,224,212,0.08)' }}>
                        <Skel w={120} h={11} r={4} mb={16} />
                        <Skel w="100%" h={160} r={8} mb={12} />
                        <Skel w="100%" h={60} r={6} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page real-dashboard">
            <style>{`
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
                @keyframes dropIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
                @keyframes barGrow { from { transform:scaleY(0); transform-origin:bottom } to { transform:scaleY(1); transform-origin:bottom } }
                /* KPI cards stagger in */
                .kpi-card { transition: transform 0.18s ease, box-shadow 0.18s ease; animation: fadeUp 0.35s ease both; }
                .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.25); }
                .kpi-card:nth-child(1) { animation-delay: 0.04s }
                .kpi-card:nth-child(2) { animation-delay: 0.10s }
                .kpi-card:nth-child(3) { animation-delay: 0.16s }
                .kpi-card:nth-child(4) { animation-delay: 0.22s }
                /* Section cards: NO delay so they are never stuck at opacity:0 */
                .db-section-card { transition: transform 0.18s ease, box-shadow 0.18s ease; animation: fadeUp 0.4s ease both; }
                .db-section-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.2); }
                .bell-dropdown { animation: dropIn 0.15s ease; }
                .db-live-wrap { position: relative; }
                .db-live-wrap .db-sync-tip {
                    display: none; position: absolute; top: calc(100% + 6px); left: 50%; transform: translateX(-50%);
                    background: rgba(6,29,32,0.96); border: 1px solid rgba(93,224,212,0.2); border-radius: 6px;
                    padding: 4px 10px; font-size: 11px; color: #5de0d4; white-space: nowrap; z-index: 200;
                    pointer-events: none;
                }
                .db-live-wrap:hover .db-sync-tip { display: block; }
                .db-delta-badge { display:inline-flex; align-items:center; gap:3px; font-size:10px; font-weight:700; border-radius:4px; padding:2px 6px; margin-top:4px; }
            `}</style>

            {/* ═══ MERGED TOP BAR ═══ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: 'var(--card-bg, #061d20)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(93, 224, 212, 0.1)' }}>
                {/* Left: greeting */}
                <div>
                    <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 700, color: 'var(--text-color,#dffafa)' }}>
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.name}
                    </h1>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted,#769293)' }}>Here's what's happening across your inventory today.</p>
                </div>

                {/* Centre: search */}
                <div className="db-search-bar" style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', padding: '7px 14px', width: '34%' }}>
                    <Search size={15} color="var(--text-muted,#769293)" />
                    <input type="text" placeholder="Global search..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-color,#dffafa)', marginLeft: '10px', width: '100%', fontSize: '13px' }} />
                    <div className="db-kbd-chip">⌘K</div>
                </div>

                {/* Right: live indicator + date + bell + user */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Live + sync — tooltip on hover shows last sync time */}
                    <div className="db-live-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted,#769293)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#5de0d4' }}>
                            <span style={{ width: '6px', height: '6px', backgroundColor: 'currentColor', borderRadius: '50%', boxShadow: '0 0 8px currentColor' }} />
                            Live
                        </span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        <button onClick={loadDashboard} style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: 'var(--text-muted,#769293)', display: 'flex', opacity: 0.7 }}>
                            <RefreshCw size={12} />
                        </button>
                        {lastUpdated && (
                            <span className="db-sync-tip">Synced {formatTime(lastUpdated)}</span>
                        )}
                    </div>

                    <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255,255,255,0.08)' }}></div>

                    {/* Bell with count badge + dropdown */}
                    <div ref={bellRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setBellOpen(o => !o)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: bellOpen ? '#5de0d4' : 'var(--text-muted,#769293)' }}
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            {alertCount > 0 && (
                                <div style={{ position: 'absolute', top: -1, right: -1, minWidth: '16px', height: '16px', backgroundColor: '#ff6b6b', borderRadius: '8px', border: '2px solid var(--card-bg,#061d20)', fontSize: '9px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: '0 3px' }}>
                                    {alertCount > 9 ? '9+' : alertCount}
                                </div>
                            )}
                        </button>

                        {bellOpen && (
                            <div className="bell-dropdown" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '300px', backgroundColor: 'var(--card-bg,#061d20)', border: '1px solid rgba(93,224,212,0.15)', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 1000, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(93,224,212,0.1)' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-color,#dffafa)' }}>Stock Alerts</span>
                                    <button onClick={() => setBellOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted,#769293)', display: 'flex' }}><X size={14} /></button>
                                </div>
                                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                                    {alertItems.length === 0 ? (
                                        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted,#769293)', fontSize: '13px' }}>
                                            <CheckCircle2 size={24} color="#4bb9a2" style={{ marginBottom: 8 }} />
                                            <div>All stock levels healthy</div>
                                        </div>
                                    ) : alertItems.map((a, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: i < alertItems.length - 1 ? '1px solid rgba(93,224,212,0.06)' : 'none' }}>
                                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: a.color, flexShrink: 0 }}></div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color,#dffafa)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                                                <div style={{ fontSize: '11px', color: a.color }}>{a.msg}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {alertCount > 0 && (
                                    <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(93,224,212,0.1)' }}>
                                        <button onClick={() => { window.dispatchEvent(new CustomEvent('open-inventory')); setBellOpen(false); }} style={{ width: '100%', background: 'rgba(93,224,212,0.07)', border: '1px solid rgba(93,224,212,0.15)', borderRadius: '7px', padding: '7px', color: '#5de0d4', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                            View all in Inventory →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255,255,255,0.08)' }}></div>

                    {/* User chip */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--primary-light,#5de0d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: '13px' }}>
                            {user.name.charAt(0)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-color,#dffafa)', lineHeight: 1.2 }}>{user.name}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted,#769293)' }}>{user.role}</span>
                        </div>
                        <ChevronDown size={13} color="var(--text-muted,#769293)" />
                    </div>
                </div>
            </div>

            {/* HERO PANEL */}
            <section className="db-section-card" style={{ background: 'linear-gradient(135deg, var(--card-bg, #061d20) 0%, rgba(93,224,212,0.07) 100%)', borderRadius: '16px', padding: '20px 28px 0 28px', marginBottom: '20px', border: '1px solid rgba(110,220,210,0.15)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-muted, #769293)', textTransform: 'uppercase', margin: 0 }}>Total Inventory Value</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(75,185,162,0.15)', color: '#4bb9a2', padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                                <TrendingUp size={12} /> +4.2% this week
                            </div>
                        </div>
                        <h2 style={{ fontSize: '34px', margin: 0, fontWeight: 800, color: 'var(--text-color, #dffafa)', letterSpacing: '-1px' }}>
                            ₹{Number(animatedInventoryValue || 0).toLocaleString("en-IN")}
                        </h2>
                    </div>
                    <div style={{ textAlign: 'right', zIndex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color, #dffafa)', margin: '0 0 2px' }}>{stats?.totalProducts ?? 0} products</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color, #dffafa)', margin: 0 }}>{stats?.totalStock ?? 0} units total</p>
                    </div>
                </div>
                {/* Sparkline with first/last date axis labels — padded margins prevent label clipping */}
                <div style={{ position: 'relative', zIndex: 0, height: '80px', marginLeft: '-28px', marginRight: '-28px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData} margin={{ top: 4, right: 36, left: 36, bottom: 0 }}>
                            <defs>
                                <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#5de0d4" stopOpacity={0.22}/>
                                    <stop offset="100%" stopColor="#5de0d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="day"
                                hide={false}
                                tickLine={false}
                                axisLine={false}
                                fontSize={9}
                                stroke="rgba(118,146,147,0.5)"
                                interval={28}
                                tickFormatter={(v) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() - (29 - v));
                                    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(6,29,32,0.97)', border: '1px solid rgba(93,224,212,0.2)', borderRadius: '8px', fontSize: '12px', padding: '6px 10px' }}
                                formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Value']}
                                labelFormatter={(v) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() - (29 - v));
                                    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                                }}
                                cursor={{ stroke: 'rgba(93,224,212,0.3)', strokeWidth: 1 }}
                            />
                            <Area type="monotone" dataKey="val" stroke="#5de0d4" strokeWidth={2} fillOpacity={1} fill="url(#heroGrad)" dot={false} activeDot={{ r: 3, fill: '#5de0d4', strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* 4-CARD KPI ROW */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                {[
                    { label: 'Products',     value: animatedTotalProducts,  delta: { text: '+2 this week',        sign: +1 }, icon: <Package size={18} />,       color: '#5de0d4', border: 'rgba(93,224,212,0.15)',  spark: miniSpark(1) },
                    { label: 'Total Units',  value: animatedTotalStock,     delta: { text: '+34 units this week', sign: +1 }, icon: <Layers size={18} />,         color: '#5de0d4', border: 'rgba(93,224,212,0.1)',   spark: miniSpark(2) },
                    { label: 'Low Stock',    value: lowStockProducts,       delta: { text: '+1 since yesterday',  sign: -1 }, icon: <AlertTriangle size={18} />, color: '#e8b84d', border: 'rgba(232,184,77,0.2)',  spark: miniSpark(3) },
                    { label: 'Out of Stock', value: outOfStockProducts,     delta: { text: '-2 since yesterday',  sign: +1 }, icon: <Ban size={18} />,            color: '#ff6b6b', border: 'rgba(255,107,107,0.2)', spark: miniSpark(4) },
                ].map(({ label, value, delta, icon, color, border, spark }) => {
                    const isActive = activeKpi === label;
                    // For stock-health metrics (low/out), FEWER is good — green when sign>0 (dropping), amber when sign<0 (rising)
                    const isHealthMetric = label === 'Low Stock' || label === 'Out of Stock';
                    const isGood = isHealthMetric ? delta.sign > 0 : delta.sign > 0;
                    const deltaColor = isGood ? '#4bb9a2' : '#e8b84d';
                    const arrow = delta.text.startsWith('-') ? '▼' : '▲';
                    return (
                        <div
                            key={label}
                            className="kpi-card"
                            onMouseEnter={() => setActiveKpi(label)}
                            onMouseLeave={() => setActiveKpi(null)}
                            style={{
                                padding: '18px',
                                background: 'var(--card-bg, #061d20)',
                                borderRadius: '12px',
                                border: `1px solid ${isActive ? color : border}`,
                                boxShadow: isActive ? `0 0 0 1px ${color}30, 0 0 20px ${color}18` : 'none',
                                display: 'flex', flexDirection: 'column',
                                position: 'relative', overflow: 'hidden',
                                cursor: 'default',
                                willChange: 'transform'
                            }}
                        >
                            {/* Label row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ color: 'var(--text-muted, #769293)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</span>
                                <div style={{ padding: '6px', backgroundColor: `${color}28`, borderRadius: '7px', color }}>{icon}</div>
                            </div>
                            {/* Number + sparkline in same row */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-color, #dffafa)', lineHeight: 1 }}>{value}</div>
                                {/* Sparkline — beside the number. ID must have no spaces for SVG url() to resolve */}
                                <div style={{ width: '70px', height: '32px', flexShrink: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id={`kpi-fill-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={color} stopOpacity={0.25}/>
                                                    <stop offset="100%" stopColor={color} stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id={`kpi-stroke-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor={color} stopOpacity={0}/>
                                                    <stop offset="100%" stopColor={color} stopOpacity={1}/>
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone" dataKey="v"
                                                stroke={`url(#kpi-stroke-${label.replace(/\s+/g, '-')})`}
                                                strokeWidth={1.5}
                                                fill={`url(#kpi-fill-${label.replace(/\s+/g, '-')})`}
                                                dot={false}
                                                activeDot={false}
                                                isAnimationActive={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            {/* Delta pill — sized to text only */}
                            <div style={{ display: 'flex' }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                                    fontSize: '10px', fontWeight: 700, borderRadius: '4px',
                                    padding: '2px 6px',
                                    background: `${deltaColor}18`, color: deltaColor
                                }}>
                                    {arrow} {delta.text}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* STOCK FLOW + DONUT ROW — alignItems:stretch so cards match height */}
            <section style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px', marginBottom: '20px', alignItems: 'stretch' }}>

                {/* STOCK FLOW CHART (60%) */}
                <div className="dashboard-section db-section-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="section-heading no-border" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="db-card-title">Stock Flow — 14 Days</h2>
                        {/* Inline legend */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#4bb9a2' }} />
                                Stock In
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#df8268' }} />
                                Stock Out
                            </div>
                        </div>
                    </div>
                    {/* flex:1 so chart area fills remaining card height — no dead gap */}
                    <div style={{ padding: '0 20px 20px 20px', flex: 1, minHeight: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aggregatedStockData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--text-muted)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} width={30} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'var(--card-bg, #061d20)', border: '1px solid rgba(93,224,212,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                                <Bar dataKey="in" name="Stock In" fill="#4bb9a2" radius={[3,3,0,0]} barSize={10} />
                                <Bar dataKey="out" name="Stock Out" fill="#df8268" radius={[3,3,0,0]} barSize={10} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* DONUT + CATEGORY BARS (40%) */}
                <div className="dashboard-section db-section-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="section-heading no-border">
                        <div><h2 className="db-card-title">Inventory Status</h2></div>
                    </div>
                    <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {/* Donut — tabIndex so it's focusable, outline suppressed in favour of teal ring */}
                        <div style={{ position: 'relative', height: '160px', outline: 'none' }}
                            tabIndex={-1}
                            onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(93,224,212,0.5)'}
                            onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Healthy', value: healthyProducts || 1, color: '#4bb9a2' },
                                            { name: 'Low stock', value: lowStockProducts, color: '#e8b84d' },
                                            { name: 'Out of stock', value: outOfStockProducts, color: '#df8268' }
                                        ]}
                                        cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                                        paddingAngle={2} dataKey="value" stroke="none"
                                        onMouseEnter={(_, i) => setActiveIndex(i)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                        onClick={() => window.dispatchEvent(new CustomEvent("open-inventory"))}
                                        style={{ cursor: 'pointer', outline: 'none' }}
                                    >
                                        <Cell fill="#4bb9a2" opacity={activeIndex === null || activeIndex === 0 ? 1 : 0.4} />
                                        <Cell fill="#e8b84d" opacity={activeIndex === null || activeIndex === 1 ? 1 : 0.4} />
                                        <Cell fill="#df8268" opacity={activeIndex === null || activeIndex === 2 ? 1 : 0.4} />
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg,#061d20)', border: '1px solid rgba(93,224,212,0.2)', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: 'var(--text-color)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-color, #dffafa)', lineHeight: 1 }}>
                                    {products.length > 0 ? Math.round((healthyProducts / products.length) * 100) : 0}<span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>%</span>
                                </strong>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px', fontWeight: 600 }}>Healthy</span>
                            </div>
                        </div>
                        {/* Legend pills */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
                            {[['#4bb9a2', 'Healthy', healthyProducts], ['#e8b84d', 'Low', lowStockProducts], ['#df8268', 'Out', outOfStockProducts]].map(([c, l, v]) => (
                                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c }}></div>
                                    {l} <strong style={{ color: 'var(--text-color)' }}>{v}</strong>
                                </div>
                            ))}
                        </div>
                        {/* Category bars — single teal family, not status colors */}
                        <div style={{ borderTop: '1px solid rgba(93,224,212,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Units by Category</div>
                            {chartData.slice(0, 4).map((cat, i) => {
                                const maxStock = chartData[0]?.stock || 1;
                                const pct = Math.round((cat.stock / maxStock) * 100);
                                // Single teal hue family — no amber/coral to avoid status confusion
                                const catColors = ['#5de0d4', '#4bb9a2', '#3a9e8e', '#2d7d70'];
                                return (
                                    <div key={cat.name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                                            <span style={{ color: 'var(--text-color)' }}>{cat.name}</span>
                                            <span>{cat.stock} units</span>
                                        </div>
                                        <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: catColors[i] || '#5de0d4', borderRadius: '3px', transition: 'width 0.8s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* TOP MOVING + REORDER ROW — align start so cards don't over-stretch */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', alignItems: 'start' }}>

                {/* TOP MOVING PRODUCTS */}
                <div className="dashboard-section db-section-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="section-heading no-border">
                        <div><h2 className="db-card-title">Top Moving Products</h2></div>
                        <button className="section-link" onClick={() => window.dispatchEvent(new CustomEvent("open-history"))} style={{ fontSize: '13px' }}>
                            View history →
                        </button>
                    </div>
                    <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {topMoving.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>No movement data yet</div>
                        ) : topMoving.map((item, i) => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '22px', fontSize: '11px', fontWeight: 700, color: i < 3 ? '#5de0d4' : 'var(--text-muted)', flexShrink: 0, textAlign: 'right' }}>#{i + 1}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#5de0d4', flexShrink: 0, marginLeft: '8px' }}>{item.total} units</span>
                                    </div>
                                    <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.round((item.total / maxTopMoving) * 100)}%`, height: '100%', backgroundColor: i < 3 ? '#5de0d4' : '#4bb9a2', borderRadius: '2px', transition: 'width 0.8s ease' }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COMPACT REORDER LIST */}
                <div className="dashboard-section db-section-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="section-heading no-border">
                        <div><h2 className="db-card-title">Reorder Required</h2></div>
                        <button className="section-link" onClick={() => window.dispatchEvent(new CustomEvent("open-reorder-center"))} style={{ fontSize: '13px' }}>
                            View all →
                        </button>
                    </div>
                    <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {reorderProducts.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0', gap: '8px' }}>
                                <CheckCircle2 size={32} color="#4bb9a2" />
                                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>All stock levels healthy</span>
                            </div>
                        ) : [...reorderProducts]
                            // Sort urgency: out-of-stock (qty=0) first, then by lowest stock ratio
                            .sort((a, b) => {
                                const aQty = Number(a.currentStock) || 0;
                                const bQty = Number(b.currentStock) || 0;
                                const aRatio = aQty / (Number(a.reorderLevel) || 1);
                                const bRatio = bQty / (Number(b.reorderLevel) || 1);
                                if (aQty === 0 && bQty !== 0) return -1;
                                if (bQty === 0 && aQty !== 0) return 1;
                                return aRatio - bRatio;
                            })
                            .slice(0, 6).map((product, idx, arr) => {
                            const stockQty = Number(product.currentStock) || 0;
                            const reorderLvl = Number(product.reorderLevel) || 1;
                            const pct = Math.min(100, (stockQty / reorderLvl) * 100);
                            const isOut = stockQty === 0;
                            const accentColor = isOut ? '#ff6b6b' : '#e8b84d';
                            return (
                                <div key={product.productId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: idx < arr.length - 1 ? '1px solid rgba(93,224,212,0.07)' : 'none' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: accentColor, flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: accentColor, flexShrink: 0, marginLeft: '8px' }}>{stockQty}/{reorderLvl}</span>
                                        </div>
                                        <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: accentColor, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent("open-reorder-center"))}
                                        style={{ flexShrink: 0, background: `${accentColor}18`, border: `1px solid ${accentColor}40`, borderRadius: '6px', color: accentColor, fontSize: '11px', fontWeight: 600, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    >
                                        Restock
                                    </button>
                                </div>
                            );
                        })}
                        {reorderProducts.length > 6 && (
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("open-reorder-center"))}
                                style={{ marginTop: '10px', background: 'rgba(255,107,107,0.06)', border: '1px dashed rgba(255,107,107,0.25)', borderRadius: '8px', padding: '8px', color: '#ff6b6b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'center' }}
                            >
                                +{reorderProducts.length - 6} more · View all →
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* RECENT ACTIVITY */}
            <section style={{ marginBottom: '20px' }}>
                <div className="dashboard-section db-section-card" style={{ display: 'flex', flexDirection: 'column' }}>

                    <div className="section-heading no-border">
                        <div><h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600, margin: 0 }}>Recent Activity</h2></div>
                        <button className="section-link" onClick={() => window.dispatchEvent(new CustomEvent("open-history"))} style={{ fontSize: '13px' }}>
                            View history →
                        </button>
                    </div>
                    <div style={{ padding: '0 20px 20px 20px' }}>
                        {movements.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>No stock movements recorded yet.</div>
                        ) : (
                            <div style={{ backgroundColor: 'rgba(93,224,212,0.05)', border: '1px solid rgba(93,224,212,0.12)', borderRadius: '12px', padding: '16px 20px 4px 20px' }}>
                                {movements.slice(0, 6).map((movement, idx, arr) => {
                                    const isLast = idx === arr.length - 1;
                                    const isIncrease = movement.quantityChanged > 0;
                                    const changeColor = isIncrease ? '#4bb9a2' : '#ff6b6b';
                                    return (
                                        <div key={movement._id} style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: changeColor, marginTop: '5px', flexShrink: 0 }}></div>
                                                {!isLast && <div style={{ width: '1px', flex: 1, backgroundColor: 'rgba(93,224,212,0.1)', marginTop: '6px', marginBottom: '2px' }}></div>}
                                            </div>
                                            <div style={{ flex: 1, paddingBottom: '12px', borderBottom: isLast ? 'none' : '1px solid rgba(93,224,212,0.08)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <strong style={{ fontSize: '13px', color: 'var(--text-color, #dffafa)' }}>{movement.product?.name || "Unknown product"}</strong>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ padding: '2px 7px', borderRadius: '4px', backgroundColor: `${changeColor}18`, color: changeColor, fontSize: '13px', fontWeight: 800 }}>
                                                            {isIncrease ? '+' : ''}{movement.quantityChanged}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #668789)', fontWeight: 500 }}>{timeAgo(movement.createdAt)}</div>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {getMovementType(movement)} · {movement.reason || "Manual Adjustment"}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );

}

export default Dashboard;
