import { useEffect, useState, useMemo } from "react";
import { getStockMovements, getActivityLogs } from "../services/api";
import { History, Activity, ArrowUpRight, ArrowDownRight, Package, Search, Calendar, Filter, List, AlignLeft, User, Tags, Settings } from "lucide-react";

function StockHistory() {
    const [activeTab, setActiveTab] = useState("movements");
    const [viewMode, setViewMode] = useState("table");
    
    const [movements, setMovements] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [dateRange, setDateRange] = useState("all"); // 'all', 'today', '7days', '30days'
    const [filterReason, setFilterReason] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [movementsData, activitiesData] = await Promise.all([
                    getStockMovements(),
                    getActivityLogs()
                ]);
                setMovements(movementsData);
                setActivities(activitiesData);
            } catch (err) {
                setError("Failed to load history data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const isWithinDateRange = (dateString) => {
        if (dateRange === "all") return true;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateRange === "today") return diffDays <= 1;
        if (dateRange === "7days") return diffDays <= 7;
        if (dateRange === "30days") return diffDays <= 30;
        return true;
    };

    const filteredMovements = useMemo(() => {
        return movements.filter(m => {
            const matchesSearch = (m.product?.name || "").toLowerCase().includes(search.toLowerCase()) || 
                                  (m.product?.sku || "").toLowerCase().includes(search.toLowerCase());
            const matchesReason = filterReason === "all" ? true : m.reason === filterReason;
            const matchesDate = isWithinDateRange(m.createdAt);
            return matchesSearch && matchesReason && matchesDate;
        });
    }, [movements, search, filterReason, dateRange]);

    const filteredActivities = useMemo(() => {
        return activities.filter(a => {
            const matchesSearch = (a.action || "").toLowerCase().includes(search.toLowerCase()) ||
                                  (a.details || "").toLowerCase().includes(search.toLowerCase());
            const matchesDate = isWithinDateRange(a.createdAt);
            return matchesSearch && matchesDate;
        });
    }, [activities, search, dateRange]);

    const uniqueReasons = useMemo(() => [...new Set(movements.map(m => m.reason))], [movements]);

    const renderMovementTable = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600 }}>Product</th>
                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Change</th>
                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600 }}>Reason</th>
                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600 }}>Performed By</th>
                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Date</th>
                </tr>
            </thead>
            <tbody>
                {filteredMovements.map((movement) => {
                    const isPositive = movement.quantityChanged > 0;
                    const color = isPositive ? 'var(--primary-light)' : '#ff6b6b';
                    return (
                        <tr key={movement._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'rgba(255,255,255,0.01)' } }}>
                            <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-color)', fontWeight: 500 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', color: 'var(--text-muted)' }}><Package size={16} /></div>
                                    <div>
                                        <div>{movement.product?.name || 'Unknown Product'}</div>
                                        {movement.product?.sku && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{movement.product.sku}</div>}
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                <div style={{ 
                                    display: 'inline-flex', alignItems: 'center', gap: '4px', 
                                    padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                                    backgroundColor: isPositive ? 'rgba(93, 224, 212, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                                    color: color, border: `1px solid ${isPositive ? 'rgba(93, 224, 212, 0.3)' : 'rgba(255, 107, 107, 0.3)'}`
                                }}>
                                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {isPositive ? '+' : ''}{movement.quantityChanged}
                                </div>
                            </td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-color)' }}>{movement.reason}</td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-muted)' }}>{movement.performedBy?.name || 'System'}</td>
                            <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right' }}>{formatDate(movement.createdAt)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    const renderActivityTable = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600 }}>Action</th>
                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600 }}>Details</th>
                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600 }}>Performed By</th>
                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Date</th>
                </tr>
            </thead>
            <tbody>
                {filteredActivities.map((activity) => (
                    <tr key={activity._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-color)', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {activity.action.includes('Category') ? <Tags size={16} color="var(--primary-light)" /> :
                                 activity.action.includes('User') ? <User size={16} color="#4bb9a2" /> :
                                 <Settings size={16} color="var(--text-muted)" />}
                                {activity.action}
                            </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>{activity.details}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-color)' }}>{activity.performedBy?.name || 'System'}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right' }}>{formatDate(activity.createdAt)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTimeline = (data, isMovement) => (
        <div style={{ padding: '24px 32px' }}>
            {data.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No records found.</p> : null}
            <div style={{ position: 'relative', borderLeft: '2px solid rgba(255,255,255,0.1)', marginLeft: '16px' }}>
                {data.map((item) => (
                    <div key={item._id} style={{ position: 'relative', paddingLeft: '32px', marginBottom: '32px' }}>
                        <div style={{ 
                            position: 'absolute', left: '-9px', top: '0', width: '16px', height: '16px', 
                            borderRadius: '50%', backgroundColor: 'var(--card-bg)', border: '2px solid var(--primary-light)' 
                        }}></div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>{formatDate(item.createdAt)}</div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {isMovement ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-color)' }}>{item.product?.name || 'Unknown Product'}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.reason} by {item.performedBy?.name || 'System'}</div>
                                    </div>
                                    <div style={{ 
                                        padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
                                        backgroundColor: item.quantityChanged > 0 ? 'rgba(93, 224, 212, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                                        color: item.quantityChanged > 0 ? 'var(--primary-light)' : '#ff6b6b'
                                    }}>
                                        {item.quantityChanged > 0 ? `+${item.quantityChanged}` : item.quantityChanged}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-color)' }}>{item.action}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.details}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--primary-light)', marginTop: '8px' }}>Performed by {item.performedBy?.name || 'System'}</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-color)' }}>History & Logs</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Track stock movements and system activity</p>
                </div>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                <button 
                    onClick={() => setActiveTab("movements")}
                    style={{ 
                        padding: '10px 20px', backgroundColor: activeTab === 'movements' ? 'rgba(93, 224, 212, 0.1)' : 'transparent',
                        color: activeTab === 'movements' ? 'var(--primary-light)' : 'var(--text-muted)', border: 'none', 
                        borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <History size={16} /> Stock Movements
                </button>
                <button 
                    onClick={() => setActiveTab("activity")}
                    style={{ 
                        padding: '10px 20px', backgroundColor: activeTab === 'activity' ? 'rgba(93, 224, 212, 0.1)' : 'transparent',
                        color: activeTab === 'activity' ? 'var(--primary-light)' : 'var(--text-muted)', border: 'none', 
                        borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Activity size={16} /> System Activity
                </button>
            </div>

            {/* FILTERS BAR */}
            <div className="dashboard-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        placeholder={`Search ${activeTab === 'movements' ? 'products' : 'actions'}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-color)', fontSize: '14px', outline: 'none' }}
                    />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)', marginLeft: '8px' }} />
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: '13px', outline: 'none' }}>
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                    </select>
                </div>

                {activeTab === 'movements' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px' }}>
                        <Filter size={14} style={{ color: 'var(--text-muted)', marginLeft: '8px' }} />
                        <select value={filterReason} onChange={(e) => setFilterReason(e.target.value)} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: '13px', outline: 'none' }}>
                            <option value="all">All Reasons</option>
                            {uniqueReasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px' }}>
                    <button onClick={() => setViewMode("table")} style={{ padding: '6px 12px', backgroundColor: viewMode === 'table' ? 'rgba(93, 224, 212, 0.1)' : 'transparent', color: viewMode === 'table' ? 'var(--primary-light)' : 'var(--text-muted)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                        <List size={14} /> Table
                    </button>
                    <button onClick={() => setViewMode("timeline")} style={{ padding: '6px 12px', backgroundColor: viewMode === 'timeline' ? 'rgba(93, 224, 212, 0.1)' : 'transparent', color: viewMode === 'timeline' ? 'var(--primary-light)' : 'var(--text-muted)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                        <AlignLeft size={14} /> Timeline
                    </button>
                </div>
            </div>

            {error && <div style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)', color: '#ff6b6b', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}

            <section className="dashboard-section" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                ) : activeTab === "movements" ? (
                    viewMode === "table" ? renderMovementTable() : renderTimeline(filteredMovements, true)
                ) : (
                    viewMode === "table" ? renderActivityTable() : renderTimeline(filteredActivities, false)
                )}
            </section>
        </div>
    );
}

export default StockHistory;