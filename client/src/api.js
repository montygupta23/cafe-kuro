import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("luxury_user") || "null");

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    const payload = response.data;

    if (payload?.success === false) {
      return Promise.reject(
        new Error(payload.message || "Request failed"),
      );
    }

    response.data = payload?.data ?? payload;
    return response;
  },
  (error) => {
    const message = error.response?.data?.message;
    if (message) error.message = message;
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);
