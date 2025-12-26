import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VerifyEmail.css";

export default function VerifyEmail() {
  // Token comes from verification link sent to user's email
  const { token } = useParams();
  const navigate = useNavigate();

  // Tracks verification state for UI feedback
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    // Call backend to verify email using token
    axios
      .get(`http://localhost:5000/api/auth/verify/${token}`)
      .then(() => {
        setStatus("success");
        // Redirect to login after short delay
        setTimeout(() => navigate("/login"), 2500);
      })
      .catch(() => {
        // Token invalid or expired
        setStatus("error");
      });
  }, [token, navigate]);

  return (
    <div className="verify-container">
      <div className="verify-card">
        {status === "verifying" && <p>Verifying your email…</p>}

        {status === "success" && (
          <p className="success">
            Email verified successfully! Redirecting to login…
          </p>
        )}

        {status === "error" && (
          <p className="error">
            Invalid or expired verification link.
          </p>
        )}
      </div>
    </div>
  );
}


/**
 * Why this page exists

When a user signs up:

Backend creates a verification token

A verification email is sent:
https://yourapp.com/verify-email/<token>

User clicks the link

This page:

Sends the token to backend

Confirms the email

Redirects user to login
 */