import { useState } from "react";
import { loginUser } from "../services/api";

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="role-login-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(93, 224, 212, 0.1) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="brand-large">IM</div>
                    <p className="eyebrow">INVENTORY MANAGEMENT</p>
                    <h1 className="login-title">Welcome</h1>

                    <p className="login-subtitle">Streamline your supply chain operations</p>

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #769293)', letterSpacing: '1px' }}>EMAIL</label>
                    <input 
                        type="email"
                        style={{ marginBottom: '16px' }}
                        value={credentials[role]?.email || ""}
                        readOnly
                    />

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #769293)', letterSpacing: '1px' }}>PASSWORD</label>
                    <input 
                        type="password"
                        style={{ marginBottom: '24px' }}
                        value={credentials[role]?.password || ""}
                        readOnly
                    />
                    
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

                    {error && <div className="error-box">{error}</div>}

                    <button
                        className="enter-button"
                        onClick={login}
                        disabled={loading}
                    >
                    {loading ? "Signing in..." : "ENTER DASHBOARD"}
                </button>

                <div className="security-note">
                    Secure role-based access
                </div>
                </div>
            </div>
        </div>
    );
}

export default Login;