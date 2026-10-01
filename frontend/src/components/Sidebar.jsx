import { useEffect, useState } from 'react';
import { Sun, Moon, LayoutDashboard, Package, RefreshCcw, Tags, History, Box, ChevronLeft, ChevronRight } from 'lucide-react';
import { getReorderProducts } from '../services/api';

function Sidebar({ user, page, setPage, logout, theme, toggleTheme }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [reorderCount, setReorderCount] = useState(0);

    useEffect(() => {
        const checkReorder = async () => {
            try {
                const data = await getReorderProducts();
                setReorderCount(data.length);
            } catch (err) {}
        };
        checkReorder();
    }, [page]); // Recheck when page changes

    const workspaceItems = [
        ["dashboard", "Dashboard", <LayoutDashboard size={16} />],
        ["inventory", "Inventory", <Package size={16} />],
        ["reorder", "Reorder", <RefreshCcw size={16} />]
    ];

    const managementItems = [
        ["categories", "Categories", <Tags size={16} />],
        ["history", "History & Logs", <History size={16} />]
    ];

    return (
        <aside className="sidebar" style={{ width: isCollapsed ? '80px' : '230px', transition: 'width 0.3s ease', overflow: 'visible', position: 'relative' }}>
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{ position: 'absolute', top: '24px', right: '-12px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-light, #5de0d4)', border: '2px solid var(--bg-color, #041719)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, color: '#000', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <div className="sidebar-brand">
                <Box size={isCollapsed ? 32 : 20} color="var(--primary-light, #5de0d4)" style={{ flexShrink: 0 }} />
                {!isCollapsed && (
                    <div style={{ lineHeight: 1.2 }}>
                        <strong style={{ letterSpacing: '1px', fontSize: '13px', fontWeight: 700 }}>INVENTORY</strong>
                        <span style={{ fontSize: '10px', letterSpacing: '1px', opacity: 0.7 }}>MANAGEMENT</span>
                    </div>
                )}
            </div>

            <div className="nav-group">
                <div className="nav-group-title">WORKSPACE</div>
                <nav>
                    {workspaceItems.map(([id, label, icon]) => (
                        <button
                            key={id}
                            className={page === id ? "nav-item active" : "nav-item"}
                            onClick={() => setPage(id)}
                            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '13px 0' : '13px 15px' }}
                            title={isCollapsed ? label : ""}
                        >
                            <span className="nav-icon" style={{ position: 'relative' }}>
                                {icon}
                            </span>
                            {!isCollapsed && label}
                            {!isCollapsed && id === 'reorder' && reorderCount > 0 && (
                                <span style={{ marginLeft: 'auto', backgroundColor: '#ff6b6b', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>{reorderCount}</span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="nav-group" style={{ marginTop: '24px' }}>
                <div className="nav-group-title">MANAGEMENT</div>
                <nav>
                    {managementItems.map(([id, label, icon]) => (
                        <button
                            key={id}
                            className={page === id ? "nav-item active" : "nav-item"}
                            onClick={() => setPage(id)}
                            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '13px 0' : '13px 15px' }}
                            title={isCollapsed ? label : ""}
                        >
                            <span className="nav-icon">{icon}</span>
                            {!isCollapsed && label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="sidebar-footer" style={{ marginTop: 'auto', borderTop: '1px solid rgba(110, 220, 210, 0.1)', paddingTop: '20px' }}>
                <button className="nav-item theme-toggle" onClick={toggleTheme} style={{ width: '100%', marginBottom: '8px', justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '13px 0' : '13px 15px' }} title={isCollapsed ? "Appearance" : ""}>
                    <span className="nav-icon">
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </span>
                    {!isCollapsed && "Appearance"}
                </button>

                <div className="sidebar-user" onClick={logout} title="Click to logout" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '10px', padding: isCollapsed ? '12px 0' : '12px 15px', cursor: 'pointer', borderRadius: '12px', transition: 'background 0.2s' }}>
                    <div className="user-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5de0d4', flexShrink: 0 }}></div>
                    {!isCollapsed && (
                        <div className="user-info" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                            <strong style={{ fontSize: '13px', color: 'var(--sidebar-text, #dffafa)' }}>{user.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--sidebar-text-muted, #769293)', marginTop: '2px' }}>{user.role || 'Admin User'}</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;