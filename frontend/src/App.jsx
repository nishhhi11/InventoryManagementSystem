import { useEffect, useState, useRef } from "react";
import { Search, LayoutDashboard, Package, RefreshCcw, Tags, History, CheckCircle, X } from "lucide-react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ReorderCenter from "./pages/ReorderCenter";
import Categories from "./pages/Categories";
import StockHistory from "./pages/StockHistory";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [page, setPage] = useState("dashboard");
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
    const [toasts, setToasts] = useState([]);
    const [cmdOpen, setCmdOpen] = useState(false);
    const [cmdQuery, setCmdQuery] = useState("");
    const cmdInputRef = useRef(null);

    const showToast = (message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    useEffect(() => {
        if (theme === "light") {
            document.body.classList.add("light-theme");
        } else {
            document.body.classList.remove("light-theme");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        const openInventory = () => setPage("inventory");
        const openReorder = () => setPage("reorder");
        const openCategories = () => setPage("categories");
        const openHistory = () => setPage("history");

        const handleToast = (e) => showToast(e.detail);
        
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setCmdOpen(true);
            }
            if (e.key === 'Escape') setCmdOpen(false);
        };

        window.addEventListener("open-inventory", openInventory);
        window.addEventListener("open-reorder-center", openReorder);
        window.addEventListener("open-categories", openCategories);
        window.addEventListener("open-history", openHistory);
        window.addEventListener("show-toast", handleToast);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("open-inventory", openInventory);
            window.removeEventListener("open-reorder-center", openReorder);
            window.removeEventListener("open-categories", openCategories);
            window.removeEventListener("open-history", openHistory);
            window.removeEventListener("show-toast", handleToast);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (cmdOpen && cmdInputRef.current) {
            cmdInputRef.current.focus();
        } else {
            setCmdQuery("");
        }
    }, [cmdOpen]);

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
    }, [user]);

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
        setPage("dashboard");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

    const executeCmd = (pageId) => {
        setPage(pageId);
        setCmdOpen(false);
    };

    const cmdOptions = [
        { id: 'dashboard', icon: <LayoutDashboard size={16}/>, label: "Go to Dashboard" },
        { id: 'inventory', icon: <Package size={16}/>, label: "Manage Inventory" },
        { id: 'reorder', icon: <RefreshCcw size={16}/>, label: "Check Reorder Center" },
        { id: 'categories', icon: <Tags size={16}/>, label: "Edit Categories" },
        { id: 'history', icon: <History size={16}/>, label: "View History & Logs" }
    ].filter(o => o.label.toLowerCase().includes(cmdQuery.toLowerCase()));

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="app">
            <Sidebar
                user={user}
                page={page}
                setPage={setPage}
                logout={logout}
                theme={theme}
                toggleTheme={toggleTheme}
            />

            <main className="main-content">
                {page === "dashboard" && <Dashboard user={user} />}
                {page === "inventory" && <Inventory user={user} />}
                {page === "reorder" && <ReorderCenter />}
                {page === "categories" && <Categories user={user} />}
                {page === "history" && <StockHistory />}
            </main>

            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className="toast">
                        <CheckCircle size={18} color="var(--primary-light)" />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{t.message}</span>
                    </div>
                ))}
            </div>

            {cmdOpen && (
                <div className="cmd-palette-overlay" onClick={() => setCmdOpen(false)}>
                    <div className="cmd-palette" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
                            <Search size={20} color="var(--text-muted)" />
                            <input 
                                ref={cmdInputRef}
                                className="cmd-input" 
                                placeholder="Search pages or commands..." 
                                value={cmdQuery}
                                onChange={e => setCmdQuery(e.target.value)}
                                style={{ borderBottom: 'none' }}
                            />
                            <button onClick={() => setCmdOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16}/></button>
                        </div>
                        <div className="cmd-list">
                            {cmdOptions.map(opt => (
                                <div key={opt.id} className="cmd-item" onClick={() => executeCmd(opt.id)}>
                                    {opt.icon} {opt.label}
                                </div>
                            ))}
                            {cmdOptions.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No results found</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;