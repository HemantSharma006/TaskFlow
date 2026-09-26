import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://taskflow-lzcg.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (error) {
      setError(error.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LOGO */}
        <div className="login-logo">
          ✓
        </div>

        {/* HEADER */}
        <h1>Welcome back</h1>

        <p className="login-subtitle">
          Sign in to continue to TaskFlow
        </p>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        {/* SIGNUP */}
        <p className="login-signup">
          Don't have an account?

          <button
            type="button"
            onClick={onSignup}
          >
            Create one
          </button>
        </p>

        {/* FOOTER */}
        <p className="login-footer">
          TaskFlow • Task & Team Collaboration
        </p>

      </div>
    </div>
  );
}

export default Login;