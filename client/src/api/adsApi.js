//src/api/adsApi.jsx
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const fetchAds = async ({ limit = 20, offset = 0 } = {}) => {
  const res = await axios.get(`${API_BASE_URL}/ads`, {
    params: { limit, offset }
  });
  return res.data;
};

export const createAd = async (formData) => {
  const res = await axios.post(`${API_BASE_URL}/ads`, formData);
  return res.data;
};

