import { useAuth } from "../context/AuthContext";

export function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  return fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}
