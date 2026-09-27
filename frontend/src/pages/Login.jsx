import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { user, login, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await login(email, password);

        if (!result.success) {
            setError(result.message);
            return;
        }

        navigate("/");
    };

    return (
        <div className="login-page">
            <div className="login-decoration">
                <div className="orb orb-one"></div>
                <div className="orb orb-two"></div>

                <div className="login-preview">
                    <div className="preview-header">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

                    <div className="preview-grid">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div className="preview-large"></div>
                    </div>
                </div>
            </div>

            <div className="login-panel">
                <div className="login-brand">
                    <div className="brand-mark">IM</div>
                    <div>
                        <strong>Inventory</strong>
                        <span>Management</span>
                    </div>
                </div>

                <div className="login-content">
                    <p className="eyebrow">Welcome back</p>
                    <h1>Manage your inventory smarter.</h1>
                    <p className="login-description">
                        Monitor stock, track movements and keep
                        your retail operations organized.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email"
                            required
                        />

                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter your password"
                            required
                        />

                        {error && (
                            <div className="form-error">
                                {error}
                            </div>
                        )}

                        <button
                            className="primary-button login-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>
                    </form>
                </div>

                <p className="login-footer">
                    Inventory Management System
                </p>
            </div>
        </div>
    );
};

export default Login;
