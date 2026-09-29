import { useState } from "react";
import { loginUser } from "../services/api";
import { Box, Activity, History, Users, Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon, Shield, User } from "lucide-react";

const credentials = {
    Admin: {
        email: "admin@inventory.com",
        password: "admin123"
    },
    Staff: {
        email: "staff@inventory.com",
        password: "staff123"
    }
};

const isDemo = true;

function Login({ onLogin, theme, toggleTheme }) {
    const [role, setRole] = useState("Admin");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [shake, setShake] = useState(false);
    const [success, setSuccess] = useState(false);

    const login = async () => {
        setError("");
        setLoading(true);

        try {
            const { email, password } = credentials[role];
            const data = await loginUser(email, password);

            setSuccess(true);
            setTimeout(() => {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                onLogin(data.user);
            }, 800);
        } catch (error) {
            setError(error.message);
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-success-overlay">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Box size={48} />
                    Preparing workspace...
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-brand-panel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '40px' }}>
                    <h1 style={{ fontSize: '48px', margin: '0 0 16px', lineHeight: 1.1 }}>Know your stock.<br /><span className="text-gradient">Always.</span></h1>
                    <p style={{ fontSize: '18px', color: '#8bbab7', margin: 0, maxWidth: '400px', lineHeight: 1.5 }}>
                        The command center for your entire supply chain.
                    </p>

                    <div className="login-features">
                        <div className="login-feature animate-stagger delay-1">
                            <div className="login-feature-icon"><Activity size={24} /></div>
                            <div className="login-feature-text">
                                <h4>Live Alerts</h4>
                                <p>Instant low-stock alerts</p>
                            </div>
                        </div>
                        <div className="login-feature animate-stagger delay-2">
                            <div className="login-feature-icon"><History size={24} /></div>
                            <div className="login-feature-text">
                                <h4>Stock History</h4>
                                <p>Every movement, tracked</p>
                            </div>
                        </div>
                        <div className="login-feature animate-stagger delay-3">
                            <div className="login-feature-icon"><Users size={24} /></div>
                            <div className="login-feature-text">
                                <h4>Role-Based Access</h4>
                                <p>Secure your data for admins and staff</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="login-visual-container" style={{ flex: 1.2, display: 'flex', justifyContent: 'flex-end', paddingRight: 0 }}>
                    <div className="floating-preview" style={{ marginRight: '-40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <strong style={{ color: 'white', fontSize: '16px' }}>Dashboard Overview</strong>
                            <span style={{ color: '#5de0d4', fontSize: '13px', fontWeight: 600 }}>₹72,960 <span style={{ opacity: 0.7, fontSize: '11px', fontWeight: 400 }}>Value</span></span>
                        </div>
                        
                        <div style={{ position: 'relative', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="preview-chart"></div>
                            <div style={{ position: 'absolute', textAlign: 'center' }}>
                                <div style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>60%</div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Healthy</div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                            <div className="preview-card" style={{ padding: '10px' }}>
                                <div className="preview-card-icon" style={{ background: 'rgba(93, 224, 212, 0.1)', color: '#5de0d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box size={16} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>Wireless Mouse</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Logitech MX Master</div>
                                </div>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                    LOW STOCK
                                </div>
                            </div>
                            <div className="preview-card" style={{ padding: '12px' }}>
                                <div className="preview-card-icon" style={{ background: 'rgba(93, 224, 212, 0.1)', color: '#5de0d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box size={16} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>Mechanical Keyboard</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Keychron K2</div>
                                </div>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                    IN STOCK
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={toggleTheme} 
                style={{ position: 'fixed', top: '32px', right: '32px', background: 'transparent', border: '1px solid var(--border, rgba(93, 224, 212, 0.2))', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)', cursor: 'pointer', zIndex: 100 }}
                title="Toggle Theme"
            >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className={`login-form-panel ${shake ? 'shake' : ''}`} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div className="brand-icon" style={{ margin: 0, width: '40px', height: '40px' }}><Box size={24} /></div>
                        <strong style={{ fontSize: '20px', letterSpacing: '1px', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                            INVENTORY <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', marginTop: '2px' }}>MANAGEMENT</span>
                        </strong>
                    </div>

                    <h1 className="login-title animate-stagger delay-1" style={{ fontSize: '28px', margin: '0 0 4px', color: 'var(--text-color)' }}>Welcome back</h1>
                    <p className="login-subtitle animate-stagger delay-1" style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Sign in to your workspace</p>

                    {isDemo && (
                        <div className="demo-hint animate-stagger delay-2">
                            <Activity size={14} /> Demo credentials auto-filled
                        </div>
                    )}

                    <div className="animate-stagger delay-2">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #769293)', letterSpacing: '1px' }}>EMAIL</label>
                    <div className="input-wrapper" style={{ marginBottom: '12px' }}>
                        <div className="input-icon-left"><Mail size={16} /></div>
                        <input 
                            type="email"
                            value={credentials[role]?.email || ""}
                            readOnly
                        />
                    </div>
                </div>

                <div className="animate-stagger delay-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #769293)', letterSpacing: '1px', margin: 0 }}>PASSWORD</label>
                        <a href="#" style={{ fontSize: '12px', color: 'var(--primary-light, #5de0d4)', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
                    </div>
                    <div className="input-wrapper" style={{ marginBottom: '16px' }}>
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
                </div>
                    
                <div className="role-segment-group animate-stagger delay-4" style={{ marginBottom: '8px' }}>
                        <div 
                            className="role-slider" 
                            style={{ transform: role === 'Admin' ? 'translateX(0)' : 'translateX(100%)' }}
                        />
                        <button
                            className={`role-segment ${role === 'Admin' ? 'active' : ''}`}
                            onClick={() => setRole('Admin')}
                        >
                            <Shield size={16} /> Admin
                        </button>
                        <button
                            className={`role-segment ${role === 'Staff' ? 'active' : ''}`}
                            onClick={() => setRole('Staff')}
                        >
                            <User size={16} /> Staff
                        </button>
                </div>

                <div className="animate-stagger delay-5">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted, #769293)', letterSpacing: 'normal', cursor: 'pointer' }}>
                            <input type="checkbox" className="custom-checkbox" /> Remember me
                        </label>
                    </div>

                    {error && <div className="error-box" style={{ margin: '0 0 16px' }}>{error}</div>}

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

                <div style={{ marginTop: 'auto', paddingTop: '48px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted, #769293)', opacity: 0.6 }}>
                    v1.0.0 &bull; Inventory Management System
                </div>
            </div>
        </div>
    );
}

export default Login;