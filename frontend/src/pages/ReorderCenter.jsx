import { useEffect, useState } from "react";
import { getReorderProducts, updateStock } from "../services/api";
import { Search, Bell, User, Minus, Plus, X, Package } from "lucide-react";

function ReorderCenter() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'low_stock', 'out_of_stock'

    // Top bar state
    const [search, setSearch] = useState("");
    const [bellOpen, setBellOpen] = useState(false);

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerProduct, setDrawerProduct] = useState(null);
    const [drawerAdjustment, setDrawerAdjustment] = useState(0);
    const [drawerReason, setDrawerReason] = useState("Restock");
    const [drawerSaving, setDrawerSaving] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        setLoading(true);
        getReorderProducts()
            .then(setProducts)
            .finally(() => setLoading(false));
    };

    const openDrawer = (product) => {
        // Remap fields to match Inventory.jsx drawer format where possible
        setDrawerProduct({
            _id: product.productId || product._id, // fallback depending on what API returns
            name: product.name,
            stockQuantity: product.currentStock,
            reorderLevel: product.reorderLevel
        });
        setDrawerAdjustment(0);
        setDrawerReason("Restock");
        setIsDrawerOpen(true);
    };

    const saveDrawerUpdate = async () => {
        if (!drawerProduct || drawerAdjustment === 0) return;
        setDrawerSaving(true);
        try {
            const newStock = drawerProduct.stockQuantity + drawerAdjustment;
            await updateStock(drawerProduct._id, Math.max(0, newStock), drawerReason);
            // Show toast (assuming a global toast listener exists like in Inventory)
            window.dispatchEvent(new CustomEvent('show-toast', { detail: `Stock updated: ${drawerProduct.name} ${drawerProduct.stockQuantity} → ${newStock}` }));
            setIsDrawerOpen(false);
            // Refresh list
            fetchProducts();
        } catch (error) {
            console.error("Failed to update stock", error);
            alert("Failed to update stock");
        } finally {
            setDrawerSaving(false);
        }
    };

    const filteredAndSorted = products
        .filter(p => {
            if (filter === 'out_of_stock') return p.currentStock === 0;
            if (filter === 'low_stock') return p.currentStock > 0 && p.currentStock <= p.reorderLevel;
            return true;
        })
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())))
        .sort((a, b) => a.currentStock - b.currentStock);

    const outOfStockCount = products.filter(p => p.currentStock === 0).length;
    const lowStockCount = products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderLevel).length;

    return (
        <div style={{ flex: 1, backgroundColor: 'var(--bg-color, #020c0d)', padding: '32px', overflowY: 'auto' }}>
            {/* TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted, #769293)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px' }}>Inventory Management</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-color, #dffafa)' }}>Reorder Center</h1>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            placeholder="Search products..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ 
                                backgroundColor: 'var(--elem-bg, rgba(255, 255, 255, 0.05))', 
                                border: '1px solid var(--elem-border, rgba(255, 255, 255, 0.1))', 
                                borderRadius: '20px', 
                                padding: '10px 16px 10px 40px', 
                                color: 'var(--text-color)', 
                                fontSize: '14px', 
                                width: '250px',
                                outline: 'none'
                            }} 
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setBellOpen(!bellOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--elem-bg, rgba(255, 255, 255, 0.05))' }}>
                            <Bell size={18} />
                            {outOfStockCount + lowStockCount > 0 && <span style={{ position: 'absolute', top: '10px', right: '12px', width: '8px', height: '8px', backgroundColor: '#ff6b6b', borderRadius: '50%' }}></span>}
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid var(--elem-border, rgba(255, 255, 255, 0.1))' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light, #5de0d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                            <User size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK FILTERS */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button 
                    onClick={() => setFilter('all')}
                    style={{ 
                        padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: filter === 'all' ? 'var(--primary-light, #5de0d4)' : 'var(--elem-bg, rgba(255,255,255,0.05))',
                        color: filter === 'all' ? '#000' : 'var(--text-muted)',
                        border: filter === 'all' ? 'none' : '1px solid var(--elem-border, rgba(255,255,255,0.1))'
                    }}
                >
                    All Needs ({products.length})
                </button>
                <button 
                    onClick={() => setFilter('out_of_stock')}
                    style={{ 
                        padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: filter === 'out_of_stock' ? 'rgba(255, 107, 107, 0.2)' : 'var(--elem-bg, rgba(255,255,255,0.05))',
                        color: filter === 'out_of_stock' ? '#ff6b6b' : 'var(--text-muted)',
                        border: filter === 'out_of_stock' ? '1px solid rgba(255, 107, 107, 0.4)' : '1px solid var(--elem-border, rgba(255,255,255,0.1))'
                    }}
                >
                    Out of Stock ({outOfStockCount})
                </button>
                <button 
                    onClick={() => setFilter('low_stock')}
                    style={{ 
                        padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: filter === 'low_stock' ? 'rgba(248, 168, 73, 0.2)' : 'var(--elem-bg, rgba(255,255,255,0.05))',
                        color: filter === 'low_stock' ? '#f8a849' : 'var(--text-muted)',
                        border: filter === 'low_stock' ? '1px solid rgba(248, 168, 73, 0.4)' : '1px solid var(--elem-border, rgba(255,255,255,0.1))'
                    }}
                >
                    Low Stock ({lowStockCount})
                </button>
            </div>

            <section>
                {loading ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Checking inventory...</div>
                ) : filteredAndSorted.length === 0 ? (
                    <div style={{ backgroundColor: 'var(--card-bg, #061d20)', padding: '60px 40px', borderRadius: '16px', border: '1px solid var(--elem-border, rgba(255, 255, 255, 0.05))', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: 'rgba(93, 224, 212, 0.1)', color: 'var(--primary-light, #5de0d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                            <Package size={32} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-color)', marginBottom: '8px' }}>No restocking required</h2>
                        <p style={{ color: 'var(--text-muted)' }}>All products matching this filter are currently at or above their reorder levels.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                        {filteredAndSorted.map((product) => {
                            const isOut = product.currentStock === 0;
                            const statusColor = isOut ? '#ff6b6b' : '#f8a849';
                            const statusText = isOut ? 'Out of stock' : 'Low stock';
                            const progress = Math.min(100, Math.max(0, (product.currentStock / product.reorderLevel) * 100)) || 0;
                            const suggestedReorder = Math.max(0, (product.reorderLevel * 2) - product.currentStock);

                            return (
                                <div key={product.productId} style={{ backgroundColor: 'var(--card-bg, #061d20)', padding: '24px', borderRadius: '16px', border: '1px solid var(--elem-border, rgba(255, 255, 255, 0.05))', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: statusColor, backgroundColor: isOut ? 'rgba(255, 107, 107, 0.1)' : 'rgba(248, 168, 73, 0.1)', border: \`1px solid \${isOut ? 'rgba(255, 107, 107, 0.2)' : 'rgba(248, 168, 73, 0.2)'}\` }}>
                                            {statusText}
                                        </div>
                                    </div>
    
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-color)', margin: '0 0 4px 0' }}>{product.name}</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 24px 0' }}>{product.sku || "No SKU"}</p>
    
                                    <div style={{ marginBottom: '24px', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                            <span>Current: <strong>{product.currentStock}</strong></span>
                                            <span>Reorder at: <strong>{product.reorderLevel}</strong></span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: \`\${progress}%\`, backgroundColor: statusColor, borderRadius: '3px' }}></div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ flex: 1, padding: '12px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.02))', borderRadius: '8px', border: '1px solid var(--elem-border, rgba(255,255,255,0.05))', textAlign: 'center' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Suggested</div>
                                            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-color)' }}>+{suggestedReorder} units</div>
                                        </div>
                                        <button 
                                            onClick={() => openDrawer(product)}
                                            style={{ padding: '12px 16px', backgroundColor: 'transparent', border: '1px solid var(--primary-light, #5de0d4)', borderRadius: '8px', color: 'var(--primary-light, #5de0d4)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(93, 224, 212, 0.1)' }}
                                            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent' }}
                                        >
                                            Restock
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Slide-over Drawer for Updates */}
            {isDrawerOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '400px', backgroundColor: 'var(--card-bg, #061d20)', height: '100%', boxShadow: '-4px 0 24px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(93, 224, 212, 0.2)', animation: 'slideIn 0.3s forwards' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-color)', margin: 0 }}>Update Stock</h2>
                            <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Product</div>
                                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-color)' }}>{drawerProduct?.name}</div>
                            </div>

                            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Current Stock</span>
                                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-color)' }}>{drawerProduct?.stockQuantity}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Adjustment</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button onClick={() => setDrawerAdjustment(a => a - 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={14} /></button>
                                        <span style={{ fontSize: '18px', fontWeight: 700, color: drawerAdjustment > 0 ? '#4bb9a2' : drawerAdjustment < 0 ? '#ff6b6b' : 'var(--text-color)', width: '40px', textAlign: 'center' }}>
                                            {drawerAdjustment > 0 ? \`+\${drawerAdjustment}\` : drawerAdjustment}
                                        </span>
                                        <button onClick={() => setDrawerAdjustment(a => a + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14} /></button>
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: '16px' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>New Stock</span>
                                    <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-light, #5de0d4)' }}>{Math.max(0, (drawerProduct?.stockQuantity || 0) + drawerAdjustment)}</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Reason for Update</label>
                                <select 
                                    value={drawerReason} 
                                    onChange={(e) => setDrawerReason(e.target.value)}
                                    style={{ width: '100%', padding: '12px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', border: '1px solid var(--elem-border, rgba(255,255,255,0.15))', borderRadius: '8px', color: 'var(--text-color)', fontSize: '14px', outline: 'none' }}
                                >
                                    <option>Restock</option>
                                    <option>Sale</option>
                                    <option>Damaged</option>
                                    <option>Returned</option>
                                    <option>Manual Adjustment</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                            <button onClick={() => setIsDrawerOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--elem-border, rgba(255,255,255,0.1))', borderRadius: '8px', color: 'var(--text-color)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={saveDrawerUpdate} disabled={drawerSaving || drawerAdjustment === 0} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--primary-light, #5de0d4)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 600, cursor: drawerAdjustment === 0 ? 'not-allowed' : 'pointer', opacity: drawerAdjustment === 0 ? 0.5 : 1 }}>
                                {drawerSaving ? "Saving..." : "Confirm Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReorderCenter;