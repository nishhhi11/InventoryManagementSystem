import { useEffect, useState, useMemo } from "react";
import { getProducts, updateStock, getCategories, createProduct } from "../services/api";
import { 
    Search, Plus, Filter, Package, AlertTriangle, Layers, Check, X, 
    Download, ChevronDown, ChevronUp, MoreHorizontal, ArrowLeft, ArrowRight, Minus,
    Bell, RefreshCw, CheckCircle2, HardDrive, Monitor, Cable, PenTool, Smartphone, Laptop, Speaker, Mouse, Keyboard, Headphones, Square, Armchair
} from "lucide-react";

function Inventory({ user = { name: "Sarah Chen", role: "Manager" } }) {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [categories, setCategories] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "", sku: "", price: "", stockQuantity: "", reorderLevel: "5", category: "", description: ""
    });

    // New States for requested features
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);
    
    // Top bar state
    const [bellOpen, setBellOpen] = useState(false);
    const alertItems = [
        { name: "MacBook Pro 16\"", msg: "Only 2 left in stock", color: "#f8a849" },
        { name: "Sony WH-1000XM5", msg: "Out of stock", color: "#ff6b6b" },
        { name: "Dell UltraSharp 27\"", msg: "Only 1 left in stock", color: "#f8a849" },
        { name: "Logitech MX Master 3S", msg: "Out of stock", color: "#ff6b6b" },
        { name: "Samsung 990 PRO 2TB", msg: "Only 3 left in stock", color: "#f8a849" },
        { name: "Anker 737 Power Bank", msg: "Out of stock", color: "#ff6b6b" },
        { name: "Keychron Q1 Pro", msg: "Only 2 left in stock", color: "#f8a849" },
        { name: "CalDigit TS4 Dock", msg: "Only 1 left in stock", color: "#f8a849" }
    ];
    const alertCount = alertItems.length;

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerProduct, setDrawerProduct] = useState(null);
    const [drawerAdjustment, setDrawerAdjustment] = useState(0);
    const [drawerReason, setDrawerReason] = useState("Manual Adjustment");
    const [drawerSaving, setDrawerSaving] = useState(false);

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

        const handleSetFilter = (e) => {
            if (e.detail) setStatusFilter(e.detail);
        };
        window.addEventListener('set-inventory-filter', handleSetFilter);
        return () => window.removeEventListener('set-inventory-filter', handleSetFilter);
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

    // Sort & Filter
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter(p => {
            const matchCategory = filterCategory === "all" ? true : p.category?._id === filterCategory;
            let matchStatus = true;
            const isOut = p.stockQuantity === 0;
            const isLow = !isOut && p.stockQuantity <= p.reorderLevel;
            if (filterStatus === "in_stock") matchStatus = !isOut && !isLow;
            else if (filterStatus === "low_stock") matchStatus = isLow;
            else if (filterStatus === "out_of_stock") matchStatus = isOut;
            return matchCategory && matchStatus;
        });

        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];
            
            if (sortConfig.key === 'category') {
                aValue = a.category?.name || "";
                bValue = b.category?.name || "";
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [products, filterCategory, filterStatus, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
    const paginatedProducts = filteredAndSortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paginatedProducts.map(p => p._id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const exportCSV = () => {
        const headers = ["Product Name", "SKU", "Category", "Price", "Stock", "Reorder Level", "Status"];
        const rows = filteredAndSortedProducts.map(p => {
            const status = p.stockQuantity === 0 ? "Out of Stock" : p.stockQuantity <= p.reorderLevel ? "Low Stock" : "In Stock";
            return [
                `"${p.name}"`, 
                `"${p.sku}"`, 
                `"${p.category?.name || ""}"`, 
                p.price, 
                p.stockQuantity, 
                p.reorderLevel,
                `"${status}"`
            ].join(",");
        });
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openDrawer = (product) => {
        setDrawerProduct(product);
        setDrawerAdjustment(0);
        setDrawerReason("Manual Adjustment");
        setIsDrawerOpen(true);
    };

    const saveDrawerUpdate = async () => {
        if (!drawerProduct || drawerAdjustment === 0) return;
        try {
            setDrawerSaving(true);
            const newStock = drawerProduct.stockQuantity + drawerAdjustment;
            await updateStock(drawerProduct._id, Math.max(0, newStock), drawerReason);
            setIsDrawerOpen(false);
            window.dispatchEvent(new CustomEvent('show-toast', { detail: `Stock updated: ${drawerProduct.name} ${drawerProduct.stockQuantity} → ${newStock}` }));
            setDrawerProduct(null);
            await loadProducts();
        } catch (error) {
            setError(error.message);
        } finally {
            setDrawerSaving(false);
        }
    };

    const totalFiltered = filteredAndSortedProducts.length;
    const totalUnits = filteredAndSortedProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
    const needsRestockCount = filteredAndSortedProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity < p.reorderLevel).length;

    const getCategoryIcon = (categoryName, productName) => {
        const name = (productName || "").toLowerCase();
        const cat = (categoryName || "").toLowerCase();
        
        if (name.includes('chair')) return <Armchair size={18} />;
        if (name.includes('mat')) return <Square size={18} />;
        if (name.includes('speaker') || name.includes('audio')) return <Speaker size={18} />;
        if (name.includes('mouse')) return <Mouse size={18} />;
        if (name.includes('keyboard')) return <Keyboard size={18} />;
        if (name.includes('headphone')) return <Headphones size={18} />;
        
        if (cat.includes('storage') || name.includes('drive') || name.includes('ssd')) return <HardDrive size={18} />;
        if (cat.includes('monitor') || name.includes('display')) return <Monitor size={18} />;
        if (cat.includes('cable') || name.includes('adapter')) return <Cable size={18} />;
        if (cat.includes('office') || name.includes('pen')) return <PenTool size={18} />;
        if (cat.includes('laptop') || name.includes('computer') || name.includes('macbook')) return <Laptop size={18} />;
        if (cat.includes('phone') || name.includes('mobile')) return <Smartphone size={18} />;
        return <Package size={18} />;
    };

    return (
        <div className="page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px', position: 'relative' }}>
            {/* ═══ MERGED TOP BAR ═══ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: 'var(--card-bg, #061d20)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(93, 224, 212, 0.1)' }}>
                {/* Left: greeting */}
                <div>
                    <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 700, color: 'var(--text-color,#dffafa)' }}>
                        Inventory
                    </h1>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted,#769293)' }}>Manage and track your product inventory.</p>
                </div>

                {/* Centre: search */}
                <div className="db-search-bar" style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', padding: '7px 14px', width: '34%', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', border: '1px solid var(--elem-border, rgba(255,255,255,0.05))' }}>
                    <Search size={15} color="var(--text-muted,#769293)" />
                    <input type="text" placeholder="Global search..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-color,#dffafa)', marginLeft: '10px', width: '100%', fontSize: '13px' }} />
                    <div className="db-kbd-chip" style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: 'var(--card-bg)', borderRadius: '4px', color: 'var(--text-muted)', border: '1px solid var(--elem-border)' }}>⌘K</div>
                </div>

                {/* Right: live indicator + date + bell + user */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="db-live-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted,#769293)', position: 'relative' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5de0d4', fontWeight: 600 }}>
                            <span style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%', boxShadow: '0 0 8px currentColor' }} />
                            Live
                        </span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <span style={{ color: 'var(--text-color)', fontWeight: 500 }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        <button onClick={loadProducts} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted,#769293)', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-color)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255,255,255,0.08)' }}></div>

                    {/* Bell */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setBellOpen(o => !o)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: bellOpen ? '#5de0d4' : 'var(--text-muted,#769293)' }}
                        >
                            <Bell size={22} />
                            {alertCount > 0 && (
                                <div style={{ position: 'absolute', top: 4, right: 4, minWidth: '20px', height: '20px', backgroundColor: '#ff6b6b', borderRadius: '10px', border: '2px solid var(--card-bg,#061d20)', fontSize: '11px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: '0 4px' }}>
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
                                    {alertItems.map((a, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: i < alertItems.length - 1 ? '1px solid rgba(93,224,212,0.06)' : 'none' }}>
                                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: a.color, flexShrink: 0 }}></div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color,#dffafa)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                                                <div style={{ fontSize: '11px', color: a.color }}>{a.msg}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255,255,255,0.08)' }}></div>

                    {/* User chip */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--primary-light,#5de0d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: '13px' }}>
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-color,#dffafa)', lineHeight: 1.2 }}>{user?.name || "User"}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted,#769293)' }}>{user?.role || "Manager"}</span>
                        </div>
                        <ChevronDown size={13} color="var(--text-muted,#769293)" />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-muted, #769293)', textTransform: 'uppercase' }}>{totalFiltered} products</h2>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={exportCSV}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: 'var(--card-bg, #ffffff)', color: 'var(--text-color, #dffafa)',
                            border: '1px solid var(--elem-border, rgba(255,255,255,0.1))', padding: '10px 16px', 
                            borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        <Download size={16} /> Export CSV
                    </button>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: 'var(--primary-light, #5de0d4)',
                            color: '#000000',
                            border: 'none',
                            padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        <Plus size={16} />
                        Add Product
                    </button>
                </div>
            </div>

            {error && <div style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)', color: '#ff6b6b', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}

            {/* SEARCH & FILTER CHIPS */}
            <div className="dashboard-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #769293)' }} />
                        <input
                            placeholder="Search products or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 36px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.03))', border: '1px solid var(--elem-border, rgba(255,255,255,0.1))', borderRadius: '8px', color: 'var(--text-color, #dffafa)', fontSize: '14px', outline: 'none' }}
                        />
                    </div>
                </div>
                
                {/* Filter Chips */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-color)', fontWeight: 600, textTransform: 'uppercase', opacity: 0.9 }}>Status:</span>
                        {['all', 'in_stock', 'low_stock', 'out_of_stock'].map(status => {
                            const count = products.filter(p => {
                                if (status === 'all') return true;
                                const isOut = p.stockQuantity === 0;
                                const isLow = !isOut && p.stockQuantity <= p.reorderLevel;
                                if (status === 'in_stock') return !isOut && !isLow;
                                if (status === 'low_stock') return isLow;
                                if (status === 'out_of_stock') return isOut;
                                return false;
                            }).length;
                            return (
                                <button 
                                    key={status}
                                    onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                                    style={{ 
                                        padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
                                        backgroundColor: filterStatus === status ? 'var(--primary-light, #5de0d4)' : 'var(--elem-bg, rgba(255,255,255,0.05))',
                                        color: filterStatus === status ? '#000' : 'var(--text-muted)', transition: 'all 0.2s'
                                    }}
                                >
                                    {status.replace(/_/g, ' ').toUpperCase()} {count}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '24px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-color)', fontWeight: 600, textTransform: 'uppercase', opacity: 0.9 }}>Category:</span>
                        <button onClick={() => { setFilterCategory('all'); setCurrentPage(1); }} style={{ padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', backgroundColor: filterCategory === 'all' ? 'var(--primary-light, #5de0d4)' : 'var(--elem-bg, rgba(255,255,255,0.05))', color: filterCategory === 'all' ? '#000' : 'var(--text-muted)' }}>All</button>
                        {categories.map(cat => (
                            <button 
                                key={cat._id}
                                onClick={() => { setFilterCategory(cat._id); setCurrentPage(1); }}
                                style={{ padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', backgroundColor: filterCategory === cat._id ? 'var(--primary-light, #5de0d4)' : 'var(--elem-bg, rgba(255,255,255,0.05))', color: filterCategory === cat._id ? '#000' : 'var(--text-muted)' }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <section className="dashboard-section" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                {selectedIds.length > 0 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: 'var(--primary-light, #5de0d4)', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button onClick={() => setSelectedIds([])} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#000' }}><X size={16} /></button>
                            <span style={{ color: '#000', fontWeight: 600, fontSize: '14px' }}>{selectedIds.length} selected</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={{ padding: '6px 12px', backgroundColor: 'rgba(0,0,0,0.1)', color: '#000', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Change Category</button>
                            <button onClick={exportCSV} style={{ padding: '6px 12px', backgroundColor: 'rgba(0,0,0,0.1)', color: '#000', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Export</button>
                            <button onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${selectedIds.length} product(s)?`)) {
                                    // Implementation of bulk delete would go here
                                    setSelectedIds([]);
                                }
                            }} style={{ padding: '6px 12px', backgroundColor: '#e03131', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--table-header-bg, rgba(0,0,0,0.1))', borderBottom: '1px solid var(--elem-border, rgba(255,255,255,0.05))' }}>
                                    <th style={{ padding: '16px 16px', width: '40px' }}></th>
                                    <th style={{ padding: '16px 16px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Product</th>
                                    <th style={{ padding: '16px 16px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>SKU</th>
                                    <th style={{ padding: '16px 16px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category</th>
                                    <th style={{ padding: '16px 16px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                                    <th style={{ padding: '16px 16px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Price</th>
                                    <th style={{ padding: '16px 16px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Stock</th>
                                    <th style={{ padding: '16px 24px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '16px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }} /></td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                                                <div style={{ width: '120px', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}><div style={{ width: '60px', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }} /></td>
                                        <td style={{ padding: '16px' }}><div style={{ width: '80px', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }} /></td>
                                        <td style={{ padding: '16px' }}><div style={{ width: '70px', height: '20px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)' }} /></td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}><div style={{ width: '50px', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 'auto' }} /></td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}><div style={{ width: '80px', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 'auto' }} /></td>
                                        <td style={{ padding: '16px' }}></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : filteredAndSortedProducts.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)' }}>
                            <Package size={24} />
                        </div>
                        <h3 style={{ fontSize: '16px', color: 'var(--text-color, #dffafa)', marginBottom: '8px' }}>No products found</h3>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--table-header-bg, rgba(0,0,0,0.1))', borderBottom: '1px solid var(--elem-border, rgba(255,255,255,0.05))' }}>
                                    <th style={{ padding: '16px 16px', width: '40px' }}>
                                        <input type="checkbox" className="custom-checkbox" onChange={handleSelectAll} checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0} style={{ cursor: 'pointer' }} />
                                    </th>
                                    {[
                                        { key: 'name', label: 'Product' },
                                        { key: 'sku', label: 'SKU' },
                                        { key: 'category', label: 'Category' },
                                        { key: 'status', label: 'Status' },
                                        { key: 'price', label: 'Price' },
                                        { key: 'stockQuantity', label: 'Stock' }
                                    ].map(col => (
                                        <th 
                                            key={col.key} 
                                            onClick={() => handleSort(col.key)}
                                            style={{ padding: '16px 16px', color: 'var(--text-muted, #769293)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, cursor: 'pointer', userSelect: 'none', textAlign: (col.key === 'price' || col.key === 'stockQuantity') ? 'right' : 'left' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: (col.key === 'price' || col.key === 'stockQuantity') ? 'flex-end' : 'flex-start', gap: '4px' }}>
                                                {col.label}
                                                {sortConfig.key === col.key ? (
                                                    sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                                ) : (
                                                    <div style={{ width: '12px', height: '12px', opacity: 0.2 }}><ChevronDown size={12} /></div>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th style={{ padding: '16px 24px', textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.map((product) => {
                                    const isOut = product.stockQuantity === 0;
                                    const isLow = !isOut && product.stockQuantity <= product.reorderLevel;
                                    const statusLabel = isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock";
                                    const statusColor = isOut ? "#df8268" : isLow ? "#e8b84d" : "#4bb9a2";
                                    const stockProgress = product.reorderLevel > 0 ? Math.min(100, (product.stockQuantity / product.reorderLevel) * 100) : 100;

                                    return (
                                        <tr key={product._id} className="inventory-table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', backgroundColor: selectedIds.includes(product._id) ? 'var(--row-selected, rgba(93, 224, 212, 0.05))' : 'transparent', transition: 'background-color 0.2s' }}>
                                            <td style={{ padding: '16px 16px' }}>
                                                <input type="checkbox" className="custom-checkbox" checked={selectedIds.includes(product._id)} onChange={() => toggleSelect(product._id)} style={{ cursor: 'pointer' }} />
                                            </td>
                                            <td style={{ padding: '16px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: `${statusColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor }}>
                                                        {getCategoryIcon(product.category?.name, product.name)}
                                                    </div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text-color, #dffafa)', fontSize: '14px' }}>
                                                        {product.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 16px', color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'monospace' }}>{product.sku || "—"}</td>
                                            <td style={{ padding: '16px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                                <span style={{ padding: '2px 0', fontSize: '13px', border: 'none', whiteSpace: 'nowrap' }}>
                                                    {product.category?.name || "—"}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 16px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: statusColor, padding: '4px 8px', backgroundColor: `${statusColor}15`, borderRadius: '12px', whiteSpace: 'nowrap' }}>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 16px', color: 'var(--text-color)', fontSize: '14px', fontWeight: 500, textAlign: 'right' }}>₹{Number(product.price).toLocaleString("en-IN")}</td>
                                            <td style={{ padding: '16px 16px', width: '150px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13px', gap: '6px', marginBottom: '6px' }}>
                                                    <strong style={{ color: 'var(--text-color)' }}>{product.stockQuantity}</strong>
                                                    <span style={{ color: 'var(--text-muted)' }}>/ min {product.reorderLevel}</span>
                                                </div>
                                                <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${stockProgress}%`, height: '100%', backgroundColor: statusColor, marginLeft: 'auto' }}></div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <button onClick={() => openDrawer(product)} className="update-stock-btn" style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#5de0d4', border: '1px solid rgba(93, 224, 212, 0.2)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                                                    Update Stock
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Pagination */}
                {totalPages > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                Showing {filteredAndSortedProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                Rows per page:
                                <select 
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                    style={{ backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', color: 'var(--text-color)', border: '1px solid var(--elem-border, rgba(255,255,255,0.05))', borderRadius: '4px', padding: '4px 8px', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', border: 'none', color: currentPage === 1 ? 'var(--btn-disabled, rgba(255,255,255,0.2))' : 'var(--text-color)', cursor: currentPage === 1 ? 'default' : 'pointer' }}><ArrowLeft size={16} /></button>
                            
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                    <button 
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', backgroundColor: currentPage === pageNum ? 'var(--primary-light, #5de0d4)' : 'transparent', color: currentPage === pageNum ? '#000' : 'var(--text-muted)', transition: 'all 0.2s' }}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', border: 'none', color: currentPage === totalPages ? 'var(--btn-disabled, rgba(255,255,255,0.2))' : 'var(--text-color)', cursor: currentPage === totalPages ? 'default' : 'pointer' }}><ArrowRight size={16} /></button>
                        </div>
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
                                            {drawerAdjustment > 0 ? `+${drawerAdjustment}` : drawerAdjustment}
                                        </span>
                                        <button onClick={() => setDrawerAdjustment(a => a + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14} /></button>
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: '16px' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>New Stock</span>
                                    <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-light)' }}>{Math.max(0, (drawerProduct?.stockQuantity || 0) + drawerAdjustment)}</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Reason for Update</label>
                                <select 
                                    value={drawerReason} 
                                    onChange={(e) => setDrawerReason(e.target.value)}
                                    style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-color)', fontSize: '14px', outline: 'none' }}
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
                            <button onClick={() => setIsDrawerOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-color)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={saveDrawerUpdate} disabled={drawerSaving || drawerAdjustment === 0} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--primary-light, #5de0d4)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 600, cursor: drawerAdjustment === 0 ? 'not-allowed' : 'pointer', opacity: drawerAdjustment === 0 ? 0.5 : 1 }}>
                                {drawerSaving ? "Saving..." : "Confirm Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slide-over Drawer for Add Product */}
            {showAddForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '420px', backgroundColor: 'var(--card-bg, #061d20)', height: '100%', boxShadow: '-4px 0 24px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(93, 224, 212, 0.2)', animation: 'slideIn 0.3s forwards' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-color)', margin: 0 }}>Add New Product</h2>
                            <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                            <form id="add-product-form" onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Product Name *</label>
                                    <input required style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', border: '1px solid var(--elem-border, rgba(255,255,255,0.15))', borderRadius: '6px', color: 'var(--text-color)', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary-light, #5de0d4)'} onBlur={(e) => e.target.style.borderColor = 'var(--elem-border, rgba(255,255,255,0.15))'} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>SKU *</label>
                                    <input required style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', border: '1px solid var(--elem-border, rgba(255,255,255,0.15))', borderRadius: '6px', color: 'var(--text-color)', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary-light, #5de0d4)'} onBlur={(e) => e.target.style.borderColor = 'var(--elem-border, rgba(255,255,255,0.15))'} value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Price (₹) *</label>
                                        <input required type="number" min="0" step="0.01" style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', border: '1px solid var(--elem-border, rgba(255,255,255,0.15))', borderRadius: '6px', color: 'var(--text-color)', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary-light, #5de0d4)'} onBlur={(e) => e.target.style.borderColor = 'var(--elem-border, rgba(255,255,255,0.15))'} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Initial Stock *</label>
                                        <input required type="number" min="0" style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', border: '1px solid var(--elem-border, rgba(255,255,255,0.15))', borderRadius: '6px', color: 'var(--text-color)', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary-light, #5de0d4)'} onBlur={(e) => e.target.style.borderColor = 'var(--elem-border, rgba(255,255,255,0.15))'} value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Category *</label>
                                    <select required style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', border: '1px solid var(--elem-border, rgba(255,255,255,0.15))', borderRadius: '6px', color: 'var(--text-color)', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary-light, #5de0d4)'} onBlur={(e) => e.target.style.borderColor = 'var(--elem-border, rgba(255,255,255,0.15))'} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                        <option value="" disabled>Select category</option>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted, #769293)' }}>Reorder Level *</label>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: 'var(--text-muted)', opacity: 0.8 }}>Alert when stock falls to this number</p>
                                    <input required type="number" min="0" style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--elem-bg, rgba(255,255,255,0.05))', border: '1px solid var(--elem-border, rgba(255,255,255,0.15))', borderRadius: '6px', color: 'var(--text-color)', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary-light, #5de0d4)'} onBlur={(e) => e.target.style.borderColor = 'var(--elem-border, rgba(255,255,255,0.15))'} value={newProduct.reorderLevel} onChange={e => setNewProduct({...newProduct, reorderLevel: e.target.value})} />
                                </div>
                            </form>
                        </div>
                        
                        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                            <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--elem-border, rgba(255,255,255,0.1))', borderRadius: '8px', color: 'var(--text-color)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" form="add-product-form" disabled={adding} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--primary-light, #5de0d4)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 600, cursor: 'pointer' }}>
                                {adding ? "Adding..." : "Add Product"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Bulk Selection Floating Bar */}
            {selectedIds.length > 0 && (
                <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary-light, #5de0d4)', color: '#000', padding: '12px 24px', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 100, animation: 'slideUp 0.3s forwards' }}>
                    <strong style={{ fontSize: '14px' }}>{selectedIds.length} selected</strong>
                    <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
                    <button style={{ background: 'none', border: 'none', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Export</button>
                    <button style={{ background: 'none', border: 'none', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Restock</button>
                    <button style={{ background: 'none', border: 'none', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </div>
            )}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes slideUp { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
            `}} />
        </div>
    );
}

export default Inventory;