import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
    const location = useLocation();
    const { user } = useAuth();

    const titles = {
        "/": "Dashboard",
        "/inventory": "Inventory",
        "/reorder": "Reorder Center",
        "/categories": "Categories",
        "/history": "Stock History",
        "/activity": "Activity Log",
        "/settings": "Settings"
    };

    return (
        <header className="topbar">
            <div>
                <p className="eyebrow">Inventory Management</p>
                <h1>{titles[location.pathname] || "Inventory"}</h1>
            </div>

            <div className="topbar-right">
                <div className="topbar-search">
                    <span>⌕</span>
                    <input placeholder="Search inventory..." />
                </div>

                <button className="notification-button">
                    ♢
                    <span className="notification-dot"></span>
                </button>

                <div className="top-user">
                    <div className="mini-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
