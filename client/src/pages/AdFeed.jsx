// src/pages/AdFeed.jsx

// React hooks for state and lifecycle
import { useEffect, useState } from 'react';
// API call to fetch ads from backend
import { fetchAds } from '../api/adsApi';
import { useNavigate } from "react-router-dom";
import './AdFeed.css';

// Utility: formats backend timestamp into readable date/time
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default function AdFeed() {

  // Holds all ads fetched from backend
  const [ads, setAds] = useState([]);

  // UI states for async loading & errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Router navigation instance
  const navigate = useNavigate();

  // Clears auth token and redirects user to login
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // Fetch ads once when feed loads
  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true);
        setError('');

        // Call backend API
        const data = await fetchAds();

        // Save ads list (fallback to empty array)
        setAds(data.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load ads');
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, []);

  // Simple UI feedback states
  if (loading) return <div className="loading">Loading ads...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      {/* Top navigation bar */}
      <nav className="navbar">
        {/* Navigate to ad creation page */}
        <button
          className="nav-btn create-btn"
          onClick={() => navigate("/ads/new")}
        >
          Create Ad
        </button>

        <h1 className="nav-title">FEED HUB</h1>

        {/* Logout button */}
        <button className="nav-btn logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </nav>

      {/* Feed container */}
      <div className="feed-container">

        {/* Empty state */}
        {ads.length === 0 && <div className="no-ads">No ads yet.</div>}

        <div className="ads-grid">
          {ads.map((ad) => {

            // Use first media as thumbnail
            const thumbnail = ad.media && ad.media[0];

            // Detect media type for correct rendering
            const isVideo = thumbnail && thumbnail.media_type === 'video';

            return (
              <div key={ad.id} className="ad-card">

                {/* Media preview (image or video) */}
                {thumbnail && (
                  <div className="media-wrapper">
                    {isVideo ? (
                      <video
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${thumbnail.media_url}`}
                        className="media"
                        muted
                      />
                    ) : (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${thumbnail.media_url}`}
                        alt={ad.title}
                        className="media"
                      />
                    )}
                  </div>
                )}

                {/* Ad content */}
                <div className="ad-content">
                  <h3 className="ad-title">{ad.title}</h3>

                  {/* Shows only if AI-generated content exists */}
                  {ad.ai_description && (
                    <div className="ai-badge">✨ AI Generated</div>
                  )}

                  <div className="ad-price">Rs {ad.price}</div>

                  <div className="ad-category">
                    {ad.category} &raquo; {ad.sub_category}
                  </div>

                  <div className="ad-date">
                    Posted: {formatDate(ad.created_at)}
                  </div>

                  {/* Prefer AI description, fallback to user-written one */}
                  <p className="ad-description">
                    {ad.ai_description || ad.description}
                  </p>

                  {/* Render AI hashtags if available */}
                  {ad.hashtags && ad.hashtags.length > 0 && (
                    <div className="hashtags">
                      {ad.hashtags.map((tag, i) => (
                        <span key={i} className="hashtag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
