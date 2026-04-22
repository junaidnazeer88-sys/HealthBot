import axios from "axios";

// CHANGE THIS: Point to the Node.js server, not the ML server
const api = axios.create({
  baseURL: "https://healthbot-ujx0.onrender.com/api",
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
