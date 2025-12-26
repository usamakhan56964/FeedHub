import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VerifyEmail.css";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/auth/verify/${token}`)
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/login"), 2500);
      })
      .catch(() => {
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
