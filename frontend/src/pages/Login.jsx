import { useState } from "react";
import { loginUser } from "../services/api";

function Login({ onLogin }) {
    const [role, setRole] = useState("Admin");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const login = async () => {
        setError("");
        setLoading(true);

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

        try {
            const data = await loginUser(
                credentials[role].email,
                credentials[role].password
            );

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
            <div className="role-login-card">
                <div className="brand-large">IM</div>

                <p className="eyebrow">INVENTORY MANAGEMENT</p>

                <h1>Welcome</h1>

                <p className="login-subtitle">
                    Select your role to continue
                </p>

                <label>ROLE</label>

                <select
                    className="role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="Admin">ADMIN</option>
                    <option value="Staff">STAFF</option>
                </select>

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}

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
    );
}

export default Login;
