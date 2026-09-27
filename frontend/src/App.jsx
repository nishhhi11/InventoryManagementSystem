import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Reorder from "./pages/Reorder";
import Categories from "./pages/Categories";
import History from "./pages/History";
import Activity from "./pages/Activity";

const Settings = () => {
    const { user } = useAuth();

    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Account</p>
                    <h2>Settings</h2>
                    <p>
                        Manage your account information.
                    </p>
                </div>
            </div>

            <div className="panel settings-card">
                <div className="settings-avatar">
                    {user?.name?.charAt(0)?.toUpperCase()}
                </div>

                <div className="settings-info">
                    <div>
                        <span>Name</span>
                        <strong>{user?.name}</strong>
                    </div>

                    <div>
                        <span>Email</span>
                        <strong>{user?.email}</strong>
                    </div>

                    <div>
                        <span>Role</span>
                        <strong>{user?.role}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProtectedLayout = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-shell">
            <Sidebar />

            <div className="main-area">
                <Header />

                <main>
                    <Routes>
                        <Route
                            path="/"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/inventory"
                            element={<Inventory />}
                        />

                        <Route
                            path="/reorder"
                            element={<Reorder />}
                        />

                        <Route
                            path="/categories"
                            element={<Categories />}
                        />

                        <Route
                            path="/history"
                            element={<History />}
                        />

                        <Route
                            path="/activity"
                            element={<Activity />}
                        />

                        <Route
                            path="/settings"
                            element={<Settings />}
                        />

                        <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                        />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    user ? (
                        <Navigate to="/" replace />
                    ) : (
                        <Login />
                    )
                }
            />

            <Route
                path="/*"
                element={<ProtectedLayout />}
            />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
