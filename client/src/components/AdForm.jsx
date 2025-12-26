import { useState } from 'react';
import { createAd } from '../api/adsApi';
import './AdForm.css';

const CATEGORY_OPTIONS = {
  Electronics: ['Mobiles', 'Laptops', 'Accessories'],
  Vehicles: ['Cars', 'Bikes', 'Parts'],
  Property: ['Houses', 'Flats', 'Plots']
};

export default function AdForm({ onSuccess }) {
  const [form, setForm] = useState({
    user_id: '1',
    category: '',
    sub_category: '',
    title: '',
    description: '',
    price: ''
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isVideoSelected, setIsVideoSelected] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { sub_category: '' } : {})
    }));
  };

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

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    if (!validate()) return;

    try {
      setLoading(true);
      setError('');

      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      mediaFiles.forEach((file) => fd.append('media', file));

      const res = await createAd(fd);
      setSuccessMsg('Ad posted successfully!');

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

      if (onSuccess) onSuccess(res.ad);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create ad.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const subCategories = CATEGORY_OPTIONS[form.category] || [];

  return (
    <div className="adform-container">
      <h2 className="adform-title">Create a New Ad</h2>

      {error && <div className="adform-error">{error}</div>}
      {successMsg && <div className="adform-success">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="adform-form">
        
        {/* Category */}
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

        {/* Sub-category */}
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

        {/* Media uploader */}
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

        {/* Preview */}
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

