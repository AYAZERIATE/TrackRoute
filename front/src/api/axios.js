import axios from "axios";

const explicitBaseUrl = import.meta.env.VITE_BASEURL;
const apiBase =
  // In dev, prefer same-origin so Vite can proxy `/api` and avoid CORS headaches.
  import.meta.env.DEV ? "/api" : `${explicitBaseUrl ?? ""}/api`;

const api = axios.create({
  baseURL: apiBase,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
