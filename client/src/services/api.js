import axios from "axios";

const api = axios.create({
  // Line 4 Change:
  baseURL: "https://healthbot-ml-api.onrender.com/api",
});

// This automatically attaches your JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
