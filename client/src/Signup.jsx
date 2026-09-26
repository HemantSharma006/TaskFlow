import { useState } from "react";
import "./Signup.css";

function Signup({ onSignupSuccess, onBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =========================
    // VALIDATE PASSWORD
    // =========================

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // =========================
      // CREATE ACCOUNT
      // =========================

      const signupResponse = await fetch(
        "https://taskflow-lzcg.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(
          signupData.message || "Signup failed"
        );
      }

      // =========================
      // AUTOMATIC LOGIN
      // =========================

      const loginResponse = await fetch(
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

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(
          "Account created, but automatic login failed. Please sign in manually."
        );
      }

      // =========================
      // SAVE LOGIN SESSION
      // =========================

      localStorage.setItem(
        "token",
        loginData.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(loginData.user)
      );

      // =========================
      // DIRECTLY OPEN APP
      // =========================

      onSignupSuccess(loginData.user);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      <div className="signup-card">

        {/* LOGO */}

        <div className="signup-logo">
          ✓
        </div>

        {/* HEADING */}

        <h1>
          Create your account
        </h1>

        <p className="signup-subtitle">
          Join TaskFlow and start managing your work
        </p>

        {/* FORM */}

        <form onSubmit={handleSignup}>

          {/* NAME */}

          <div className="signup-form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

          </div>

          {/* EMAIL */}

          <div className="signup-form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="signup-form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="signup-form-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="signup-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="signup-success">
              {success}
            </div>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        {/* LOGIN LINK */}

        <p className="signup-login">

          Already have an account?

          <button
            type="button"
            onClick={onBackToLogin}
          >
            Sign In
          </button>

        </p>

        <p className="signup-footer">
          TaskFlow • Task & Team Collaboration
        </p>

      </div>

    </div>
  );
}

export default Signup;