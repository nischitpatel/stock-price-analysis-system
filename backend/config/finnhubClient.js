// import finnhub from 'finnhub';
// import dotenv from 'dotenv';

// dotenv.config();
// const apiKey = process.env.FINNHUB_API_KEY;

// const apiKeyInstance = finnhub.ApiClient.authentications['api_key'];
// apiKeyInstance.apiKey = apiKey;

// const finnhubClient = new finnhub.DefaultApi();

// export default finnhubClient;

import axios from "axios";

const finnhubClient = axios.create({
  baseURL: "https://finnhub.io/api/v1",
  timeout: 15000,
});

// attach token automatically
finnhubClient.interceptors.request.use((cfg) => {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error("Missing FINNHUB_API_KEY env");
  cfg.params = { ...(cfg.params || {}), token };
  return cfg;
});

export default finnhubClient;
