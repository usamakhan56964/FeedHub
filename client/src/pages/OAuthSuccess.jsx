import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OAuthSuccess.css";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Read token returned by backend after Google OAuth
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Save JWT and redirect user to ads feed
      localStorage.setItem("token", token);
      navigate("/ads");
    } else {
      // Fallback if OAuth failed or token missing
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="oauth-container">
      <div className="oauth-card">
        Signing you in with Google…
      </div>
    </div>
  );
}


/**
 * Why it exists

Google OAuth cannot send tokens directly to your frontend app.
Instead, the flow works like this:

User clicks "Continue with Google"
        ↓
Google authenticates user
        ↓
Backend receives Google profile
        ↓
Backend generates JWT
        ↓
Backend redirects to frontend:
   /oauth-success?token=JWT


   “OAuthSuccess acts as a bridge between Google OAuth and my frontend.
It securely captures the JWT sent by the backend after Google login, stores it, and redirects the user into the authenticated app state.”
 */