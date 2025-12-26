import { useEffect, useState } from 'react';
import { fetchAds } from '../api/adsApi';
import { useNavigate } from "react-router-dom";
import './AdFeed.css';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default function AdFeed() {

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/login", { replace: true });
}

  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchAds();
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

  if (loading) return <div className="loading">Loading ads...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        {/*<button className="nav-btn create-btn">Create Ad</button>*/}
        <button
          className="nav-btn create-btn"onClick={() => navigate("/ads/new")}>
          Create Ad
        </button>

        <h1 className="nav-title">FEED HUB</h1>
        {/*<button className="nav-btn logout-btn">Sign Out</button>*/}
        <button className="nav-btn logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </nav>

      {/* FEED CONTAINER */}
      <div className="feed-container">
        {ads.length === 0 && <div className="no-ads">No ads yet.</div>}

        <div className="ads-grid">
          {ads.map((ad) => {
            const thumbnail = ad.media && ad.media[0];
            const isVideo = thumbnail && thumbnail.media_type === 'video';

            return (
              <div key={ad.id} className="ad-card">
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

                {/*<div className="ad-content">
                  <h3 className="ad-title">{ad.title}</h3>
                  <div className="ad-price">Rs {ad.price}</div>
                  <div className="ad-category">
                    {ad.category} &raquo; {ad.sub_category}
                  </div>
                  <div className="ad-date">Posted: {formatDate(ad.created_at)}</div>
                  <p className="ad-description">{ad.description}</p>
                </div>*/}
                
                
                  <div className="ad-content">
                  <h3 className="ad-title">{ad.title}</h3>

                  {/* AI badge (only if AI content exists) */}
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

                {/* AI-aware description */}
                <p className="ad-description">
                {ad.ai_description || ad.description}
                </p>

                {/* AI hashtags */}
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

