import axios from 'axios';

const api = axios.create({ baseURL: 'site--tickerlense-backend--c2yp6pz4jpp6.code.run/api', timeout: 10000 });
// const api = axios.create({ baseURL: 'https://stock-price-analysis-system.onrender.com/api', timeout: 10000 });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

export default api;
