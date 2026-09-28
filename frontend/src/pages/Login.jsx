import { useState } from "react";
import { loginUser } from "../services/api";
import { Box, Activity, History, Users, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const credentials = {
    Admin: {
        email: "admin@inventory.com",
        password: "admin123"
    },
    Staff: {
        email: "staff@inventory.com",
        password: "staff123"
    },
    Viewer: {
        email: "viewer@inventory.com",
        password: "viewer123"
    }
};

function Login({ onLogin }) {
    const [role, setRole] = useState("Admin");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [shake, setShake] = useState(false);

    const login = async () => {
        setError("");
        setLoading(true);

        try {
            const { email, password } = credentials[role];
            const data = await loginUser(email, password);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            onLogin(data.user);
        } catch (error) {
            setError(error.message);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-brand-panel">
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontSize: '48px', margin: '0 0 16px', lineHeight: 1.1 }}>Know your stock.<br />Always.</h1>
                    <p style={{ fontSize: '18px', color: '#8bbab7', margin: 0, maxWidth: '400px', lineHeight: 1.5 }}>
                        The command center for your entire supply chain.
                    </p>

                    <div className="login-features">
                        <div className="login-feature">
                            <div className="login-feature-icon"><Activity size={24} /></div>
                            <div className="login-feature-text">
                                <h4>Live Alerts</h4>
                                <p>Get notified instantly when stock runs low</p>
                            </div>
                        </div>
                        <div className="login-feature">
                            <div className="login-feature-icon"><History size={24} /></div>
                            <div className="login-feature-text">
                                <h4>Stock History</h4>
                                <p>Track every movement and adjustment</p>
                            </div>
                        </div>
                        <div className="login-feature">
                            <div className="login-feature-icon"><Users size={24} /></div>
                            <div className="login-feature-text">
                                <h4>Role-Based Access</h4>
                                <p>Secure your data for admins and staff</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`login-form-panel ${shake ? 'shake' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div className="brand-icon" style={{ margin: 0, width: '40px', height: '40px' }}><Box size={24} /></div>
                    <strong style={{ fontSize: '20px', letterSpacing: '1px' }}>INVENTORY MANAGEMENT</strong>
                </div>

                <h1 className="login-title" style={{ fontSize: '32px', margin: '0 0 8px' }}>Welcome back</h1>
                <p className="login-subtitle">Sign in to your workspace</p>

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #769293)', letterSpacing: '1px' }}>EMAIL</label>
                    <div className="input-wrapper" style={{ marginBottom: '16px' }}>
                        <div className="input-icon-left"><Mail size={16} /></div>
                        <input 
                            type="email"
                            value={credentials[role]?.email || ""}
                            readOnly
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #769293)', letterSpacing: '1px' }}>PASSWORD</label>
                        <a href="#" style={{ fontSize: '12px', color: 'var(--primary-light, #5de0d4)', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
                    </div>
                    <div className="input-wrapper" style={{ marginBottom: '24px' }}>
                        <div className="input-icon-left"><Lock size={16} /></div>
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={credentials[role]?.password || ""}
                            readOnly
                        />
                        <div className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </div>
                    </div>
                    
                    <div className="role-segment-group">
                        {["Admin", "Staff", "Viewer"].map(r => (
                            <button
                                key={r}
                                className={`role-segment ${role === r ? 'active' : ''}`}
                                onClick={() => setRole(r)}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted, #769293)', letterSpacing: 'normal' }}>
                            <input type="checkbox" style={{ accentColor: 'var(--primary-light, #5de0d4)', width: '16px', height: '16px' }} /> Remember me
                        </label>
                    </div>

                    {error && <div className="error-box" style={{ margin: '0 0 24px' }}>{error}</div>}

                    <button
                        className="enter-button"
                        onClick={login}
                        disabled={loading}
                    >
                        {loading && <Loader2 size={18} className="spin" />}
                        {loading ? "Signing in..." : "ENTER DASHBOARD"}
                    </button>

                    <div className="security-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Lock size={12} style={{ opacity: 0.7 }} /> Secure role-based access
                    </div>
            </div>
        </div>
    );
}

export default Login;