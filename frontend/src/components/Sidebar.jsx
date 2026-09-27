import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const { user, logout } = useAuth();

    const links = [
        { path: "/", label: "Dashboard", icon: "▦" },
        { path: "/inventory", label: "Inventory", icon: "▤" },
        { path: "/reorder", label: "Reorder Center", icon: "⚠" },
        { path: "/categories", label: "Categories", icon: "▥" },
        { path: "/history", label: "Stock History", icon: "↕" },
        { path: "/activity", label: "Activity Log", icon: "◷" },
        { path: "/settings", label: "Settings", icon: "⚙" }
    ];

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-mark">IM</div>
                <div>
                    <h2>Inventory</h2>
                    <span>Management</span>
                </div>
            </div>

            <div className="user-card">
                <div className="avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="user-info">
                    <strong>{user?.name || "User"}</strong>
                    <span>{user?.email || ""}</span>
                    <small>{user?.role || "Staff"}</small>
                </div>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === "/"}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="nav-icon">{link.icon}</span>
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <button className="logout-button" onClick={logout}>
                <span>↪</span>
                Logout
            </button>
        </aside>
    );
};

export default Sidebar;
