import { Sun, Moon, LogOut, LayoutDashboard, Package, RefreshCcw, Tags, History, Activity, Box } from 'lucide-react';

function Sidebar({ user, page, setPage, logout, theme, toggleTheme }) {
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
        <aside className="sidebar">
            <div className="sidebar-brand">
                <Box size={20} color="var(--primary-light, #5de0d4)" />
                <div style={{ lineHeight: 1.2 }}>
                    <strong style={{ letterSpacing: '1px', fontSize: '13px', fontWeight: 700 }}>INVENTORY</strong>
                    <span style={{ fontSize: '10px', letterSpacing: '1px', opacity: 0.7 }}>MANAGEMENT</span>
                </div>
            </div>

            <div className="nav-group">
                <div className="nav-group-title">WORKSPACE</div>
                <nav>
                    {workspaceItems.map(([id, label, icon]) => (
                        <button
                            key={id}
                            className={page === id ? "nav-item active" : "nav-item"}
                            onClick={() => setPage(id)}
                        >
                            <span className="nav-icon">{icon}</span>
                            {label}
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
                        >
                            <span className="nav-icon">{icon}</span>
                            {label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="sidebar-footer" style={{ marginTop: 'auto', borderTop: '1px solid rgba(110, 220, 210, 0.1)', paddingTop: '20px' }}>
                <button className="nav-item theme-toggle" onClick={toggleTheme} style={{ width: '100%', marginBottom: '8px' }}>
                    <span className="nav-icon">
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </span>
                    Appearance
                </button>

                <div className="sidebar-user" onClick={logout} title="Click to logout" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', cursor: 'pointer', borderRadius: '12px', transition: 'background 0.2s' }}>
                    <div className="user-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5de0d4' }}></div>
                    <div className="user-info" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <strong style={{ fontSize: '13px', color: '#dffafa' }}>{user.name}</strong>
                        <span style={{ fontSize: '11px', color: '#769293', marginTop: '2px' }}>{user.role || 'Admin User'}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;