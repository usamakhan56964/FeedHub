import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Google icon asset for OAuth button
import GoogleIcon from "../assets/google.svg";

import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  // Auto-redirect user if already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/ads");
    }
  }, []);

  // Login form state
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // UI feedback states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Updates form fields dynamically
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handles email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Authenticate user via backend
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      // Persist JWT for protected routes
      localStorage.setItem("token", res.data.token);

      // Redirect to ads feed on success
      navigate("/ads");
    } catch (err) {
      // Show backend error or fallback message
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>

        {/* Authentication error message */}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* Email/password login */}
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Google OAuth redirect */}
          <button
            type="button"
            className="google-btn"
            onClick={() =>
              (window.location.href =
                "http://localhost:5000/api/auth/google")
            }
          >
            <img src={GoogleIcon} alt="Google" className="google-icon" />
            Continue with Google
          </button>

          {/* Switch to registration */}
          <div className="auth-switch">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="auth-link"
            >
              Create Account
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
