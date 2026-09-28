import { useEffect, useState } from "react";
import { getProducts, updateStock, getCategories, createProduct } from "../services/api";
import { Search, Plus, Filter, Package, AlertTriangle, Layers, Edit2, Check, X } from "lucide-react";

function Inventory() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [stock, setStock] = useState("");
    const [reason, setReason] = useState("Manual Adjustment");
    const [error, setError] = useState("");

    const [categories, setCategories] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "", sku: "", price: "", stockQuantity: "", reorderLevel: "", category: "", description: ""
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
                if (data.length > 0) {
                    setNewProduct(prev => ({ ...prev, category: data[0]._id }));
                }
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const query = search ? `?search=${encodeURIComponent(search)}` : "";
            const data = await getProducts(query);
            setProducts(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(loadProducts, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const saveStock = async (product) => {
        try {
            await updateStock(product._id, Number(stock), reason);
            setEditing(null);
            setStock("");
            await loadProducts();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            setAdding(true);
            setError("");
            await createProduct({
                name: newProduct.name,
                sku: newProduct.sku,
                price: Number(newProduct.price),
                stockQuantity: Number(newProduct.stockQuantity),
                reorderLevel: Number(newProduct.reorderLevel),
                category: newProduct.category,
                description: newProduct.description
            });
            setShowAddForm(false);
            setNewProduct({ name: "", sku: "", price: "", stockQuantity: "", reorderLevel: "", category: categories.length > 0 ? categories[0]._id : "", description: "" });
            await loadProducts();
        } catch (err) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchCategory = filterCategory === "all" ? true : p.category?._id === filterCategory;
        
        let matchStatus = true;
        const isOut = p.stockQuantity === 0;
        const isLow = !isOut && p.stockQuantity <= p.reorderLevel;
        if (filterStatus === "in_stock") matchStatus = !isOut && !isLow;
        else if (filterStatus === "low_stock") matchStatus = isLow;
        else if (filterStatus === "out_of_stock") matchStatus = isOut;

        return matchCategory && matchStatus;
    });

    const totalFiltered = filteredProducts.length;
    const totalUnits = filteredProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
    const needsRestockCount = filteredProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity < p.reorderLevel).length;

    return (
        <div className="page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-color, #dffafa)' }}>Products</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted, #769293)', fontSize: '14px' }}>Manage your inventory and stock levels</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        backgroundColor: showAddForm ? 'var(--card-bg, #061d20)' : 'var(--primary-light, #5de0d4)',
                        color: showAddForm ? 'var(--text-color, #dffafa)' : '#000000',
                        border: showAddForm ? '1px solid rgba(93, 224, 212, 0.2)' : 'none',
                        padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    {showAddForm ? <X size={16} /> : <Plus size={16} />}
                    {showAddForm ? "Cancel" : "Add Product"}
                </button>
            </div>

            {error && <div style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)', color: '#ff6b6b', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}

            {showAddForm && (
                <section className="dashboard-section" style={{ marginBottom: '24px', backgroundColor: 'var(--card-bg, #061d20)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(93, 224, 212, 0.15)' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-color, #dffafa)', fontSize: '16px', fontWeight: 600 }}>Add New Product</h3>
                    <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Product Name *</label>
                            <input required style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-color, #dffafa)' }} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>SKU *</label>
                            <input required style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-color, #dffafa)' }} value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Price (₹) *</label>
                            <input required type="number" min="0" step="0.01" style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-color, #dffafa)' }} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Category *</label>
                            <select required style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-color, #dffafa)' }} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                <option value="" disabled>Select category</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Initial Stock Quantity *</label>
                            <input required type="number" min="0" style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-color, #dffafa)' }} value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Reorder Level *</label>
                            <input required type="number" min="0" style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-color, #dffafa)' }} value={newProduct.reorderLevel} onChange={e => setNewProduct({...newProduct, reorderLevel: e.target.value})} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Description</label>
                            <textarea style={{ width: '100%', minHeight: '80px', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-color, #dffafa)' }} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button type="submit" style={{ backgroundColor: 'var(--primary-light, #5de0d4)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }} disabled={adding}>
                                {adding ? "Adding..." : "Add Product"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* SEARCH & FILTERS */}
            <div className="dashboard-section" style={{ display: 'flex', gap: '16px', padding: '16px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #769293)' }} />
                    <input
                        placeholder="Search products or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(93, 224, 212, 0.2)', borderRadius: '8px', color: 'var(--text-color, #dffafa)', fontSize: '14px' }}
                    />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} style={{ color: 'var(--text-muted, #769293)' }} />
                    <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ padding: '10px 32px 10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(93, 224, 212, 0.2)', borderRadius: '8px', color: 'var(--text-color, #dffafa)', fontSize: '14px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23769293\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '10px 32px 10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(93, 224, 212, 0.2)', borderRadius: '8px', color: 'var(--text-color, #dffafa)', fontSize: '14px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23769293\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>
            </div>

            {/* INVENTORY SUMMARY */}
            <div className="dashboard-section" style={{ display: 'flex', gap: '32px', padding: '16px 24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'rgba(93, 224, 212, 0.1)', borderRadius: '8px', color: 'var(--primary-light, #5de0d4)' }}><Package size={18} /></div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-color, #dffafa)' }}>{totalFiltered}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted, #769293)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Products</div>
                    </div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'rgba(93, 224, 212, 0.1)', borderRadius: '8px', color: 'var(--primary-light, #5de0d4)' }}><Layers size={18} /></div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-color, #dffafa)' }}>{totalUnits}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted, #769293)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Units</div>
                    </div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', color: '#ff6b6b' }}><AlertTriangle size={18} /></div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#ff6b6b' }}>{needsRestockCount}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted, #769293)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Needs Restock</div>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <section className="dashboard-section" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted, #769293)' }}>Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)' }}>
                            <Package size={24} />
                        </div>
                        <h3 style={{ fontSize: '16px', color: 'var(--text-color, #dffafa)', marginBottom: '8px' }}>No products found</h3>
                        <p style={{ color: 'var(--text-muted, #769293)', fontSize: '14px' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '16px 24px', color: 'var(--text-muted, #769293)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Product</th>
                                    <th style={{ padding: '16px 16px', color: 'var(--text-muted, #769293)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>SKU</th>
                                    <th style={{ padding: '16px 16px', color: 'var(--text-muted, #769293)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Category</th>
                                    <th style={{ padding: '16px 16px', color: 'var(--text-muted, #769293)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Price</th>
                                    <th style={{ padding: '16px 16px', color: 'var(--text-muted, #769293)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Stock</th>
                                    <th style={{ padding: '16px 24px', color: 'var(--text-muted, #769293)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => {
                                    const isOut = product.stockQuantity === 0;
                                    const isLow = !isOut && product.stockQuantity <= product.reorderLevel;
                                    const statusLabel = isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK" : "IN STOCK";
                                    const statusColor = isOut ? "#df8268" : isLow ? "#e8b84d" : "#4bb9a2";
                                    const isEditing = editing === product._id;

                                    return (
                                        <tr key={product._id} className="inventory-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor }}></div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-color, #dffafa)', fontSize: '14px' }}>{product.name}</div>
                                                        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', color: statusColor, marginTop: '4px' }}>{statusLabel}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 16px', color: 'var(--text-muted, #769293)', fontSize: '13px', fontFamily: 'monospace' }}>
                                                {product.sku || "—"}
                                            </td>
                                            <td style={{ padding: '16px 16px', color: 'var(--text-muted, #769293)', fontSize: '13px' }}>
                                                {product.category?.name || "—"}
                                            </td>
                                            <td style={{ padding: '16px 16px', color: 'var(--text-color, #dffafa)', fontSize: '14px', fontWeight: 500 }}>
                                                ₹{Number(product.price).toLocaleString("en-IN")}
                                            </td>
                                            <td style={{ padding: '16px 16px' }}>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={stock}
                                                        onChange={(e) => setStock(e.target.value)}
                                                        style={{ width: '70px', padding: '6px 8px', backgroundColor: 'var(--card-bg, #061d20)', border: '1px solid var(--primary-light, #5de0d4)', borderRadius: '6px', color: 'var(--text-color, #dffafa)', fontSize: '14px', outline: 'none' }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <strong style={{ color: 'var(--text-color, #dffafa)', fontSize: '16px' }}>{product.stockQuantity}</strong>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <select
                                                            value={reason}
                                                            onChange={(e) => setReason(e.target.value)}
                                                            style={{ padding: '6px 24px 6px 10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-color, #dffafa)', fontSize: '12px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23769293\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                                                        >
                                                            <option>Restock</option>
                                                            <option>Sale</option>
                                                            <option>Damaged</option>
                                                            <option>Returned</option>
                                                            <option>Manual Adjustment</option>
                                                        </select>
                                                        <button
                                                            onClick={() => saveStock(product)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: 'var(--primary-light, #5de0d4)', color: '#000', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            <Check size={14} /> Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditing(null)}
                                                            style={{ padding: '6px', backgroundColor: 'transparent', color: 'var(--text-muted, #769293)', border: 'none', cursor: 'pointer' }}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => { setEditing(product._id); setStock(product.stockQuantity); }}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'rgba(93, 224, 212, 0.1)', color: 'var(--primary-light, #5de0d4)', border: '1px solid rgba(93, 224, 212, 0.2)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                                    >
                                                        <Edit2 size={12} /> Update
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Inventory;