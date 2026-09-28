import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ReorderCenter from "./pages/ReorderCenter";
import Categories from "./pages/Categories";
import StockHistory from "./pages/StockHistory";
import ActivityLog from "./pages/ActivityLog";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [page, setPage] = useState("dashboard");
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

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

        window.addEventListener("open-inventory", openInventory);
        window.addEventListener("open-reorder-center", openReorder);
        window.addEventListener("open-categories", openCategories);
        window.addEventListener("open-history", openHistory);

        return () => {
            window.removeEventListener("open-inventory", openInventory);
            window.removeEventListener("open-reorder-center", openReorder);
            window.removeEventListener("open-categories", openCategories);
            window.removeEventListener("open-history", openHistory);
        };
    }, []);

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
                {page === "activity" && <ActivityLog />}
            </main>
        </div>
    );
}

export default App;
