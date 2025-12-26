import { useState } from 'react';
import { createAd } from '../api/adsApi';
import './AdForm.css';

/*
 * Static category → sub-category mapping
 * Used to dynamically populate dropdowns
 */
const CATEGORY_OPTIONS = {
  Electronics: ['Mobiles', 'Laptops', 'Accessories'],
  Vehicles: ['Cars', 'Bikes', 'Parts'],
  Property: ['Houses', 'Flats', 'Plots']
};

export default function AdForm({ onSuccess }) {

  /*
   * Main ad form state
   * user_id is hardcoded for now (can be replaced with auth user later)
   */
  const [form, setForm] = useState({
    user_id: '1',
    category: '',
    sub_category: '',
    title: '',
    description: '',
    price: ''
  });

  // Media handling states
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isVideoSelected, setIsVideoSelected] = useState(false);

  // UI feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /**
   * Handles text/select input changes
   * Resets sub-category when category changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { sub_category: '' } : {})
    }));
  };

  /**
   * Handles media uploads
   * Enforces:
   * - Either multiple images OR one video
   * - No mixing images + video
   */
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const hasVideo = files.some((f) => f.type.startsWith('video/'));
    const hasImage = files.some((f) => f.type.startsWith('image/'));

    if (hasVideo && hasImage) {
      setError('You can upload either images or a single video, not both.');
      return;
    }

    if (hasVideo && files.length > 1) {
      setError('Only one video is allowed.');
      return;
    }

    setError('');
    setIsVideoSelected(hasVideo);
    setMediaFiles(files);

    // Generate local preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  /**
   * Client-side validation before submit
   */
  const validate = () => {
    if (!form.category || !form.sub_category || !form.title || !form.description || !form.price) {
      setError('Please fill in all required fields.');
      return false;
    }

    if (isNaN(Number(form.price))) {
      setError('Price must be numeric.');
      return false;
    }

    if (mediaFiles.length === 0) {
      setError('Please upload at least one media file.');
      return false;
    }

    return true;
  };

  /**
   * Form submission handler
   * Sends multipart/form-data to backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    if (!validate()) return;

    try {
      setLoading(true);
      setError('');

      // Build FormData payload
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      mediaFiles.forEach((file) => fd.append('media', file));

      const res = await createAd(fd);
      setSuccessMsg('Ad posted successfully!');

      // Reset form after success
      setForm({
        user_id: '1',
        category: '',
        sub_category: '',
        title: '',
        description: '',
        price: ''
      });

      setMediaFiles([]);
      setPreviewUrls([]);
      setIsVideoSelected(false);

      // Notify parent component (optional)
      if (onSuccess) onSuccess(res.ad);

    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create ad.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Derived sub-categories based on selected category
  const subCategories = CATEGORY_OPTIONS[form.category] || [];

  return (
    <div className="adform-container">
      <h2 className="adform-title">Create a New Ad</h2>

      {error && <div className="adform-error">{error}</div>}
      {successMsg && <div className="adform-success">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="adform-form">

        {/* Category selector */}
        <div className="adform-field">
          <label>Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="adform-input"
          >
            <option value="">Select category</option>
            {Object.keys(CATEGORY_OPTIONS).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sub-category selector */}
        <div className="adform-field">
          <label>Sub-category *</label>
          <select
            name="sub_category"
            value={form.sub_category}
            onChange={handleChange}
            disabled={!form.category}
            className="adform-input"
          >
            <option value="">Select sub-category</option>
            {subCategories.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="adform-field">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="adform-input"
          />
        </div>

        {/* Description */}
        <div className="adform-field">
          <label>Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="adform-textarea"
          />
        </div>

        {/* Price */}
        <div className="adform-field">
          <label>Price (Rs) *</label>
          <input
            type="text"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="adform-input"
          />
        </div>

        {/* Media upload */}
        <div className="adform-field">
          <label>Media (multiple images or one video) *</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
            className="adform-file"
          />
          <div className="adform-rule">
            Upload multiple images OR one video. No mixing.
          </div>
        </div>

        {/* Media preview */}
        {previewUrls.length > 0 && (
          <div className="adform-preview-section">
            <div className="adform-preview-title">Preview:</div>
            <div className="adform-preview-grid">
              {previewUrls.map((url, idx) =>
                isVideoSelected ? (
                  <video key={idx} src={url} controls className="adform-preview-video" />
                ) : (
                  <img key={idx} src={url} className="adform-preview-img" />
                )
              )}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="adform-submit">
          {loading ? 'Posting...' : 'Post Ad'}
        </button>
      </form>
    </div>
  );
}
