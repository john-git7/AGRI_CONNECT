// frontend/src/axiosConfig.js
import axios from "axios";

let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.endsWith("/api")) {
  baseUrl = `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`;
}

const api = axios.create({
  baseURL: baseUrl,
});

// Automatically attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
