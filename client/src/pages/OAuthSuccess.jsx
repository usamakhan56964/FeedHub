import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OAuthSuccess.css";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/ads");
    } else {
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
