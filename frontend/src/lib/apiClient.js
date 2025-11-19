// import axios from 'axios';

// const api = axios.create({
//   baseURL: '/api',            // ← proxy to your Node backend (vite dev server or same origin in prod)
//   timeout: 10000,
// });

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const msg = err?.response?.data?.message || err.message || 'Network error';
//     return Promise.reject(new Error(msg));
//   }
// );

// export default api;

import axios from 'axios';

// const api = axios.create({
//   baseURL: '/api',     // proxied to http://localhost:5000 by vite.config.js
//   timeout: 10000,
// });

const api = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 10000 });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

export default api;
