import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Show loader and attach Authorization token
api.interceptors.request.use((config) => {
  // Determine if this is an admin route / admin request
  const isAdminPath =
    typeof window !== "undefined" &&
    (window.location.pathname.includes("mQ8vR2kX9Lp7N4") ||
      (config.url && config.url.includes("/admin")));

  const adminToken = localStorage.getItem("admin_token");
  const userToken = localStorage.getItem("token");

  const token = isAdminPath
    ? (adminToken || userToken)
    : (userToken || adminToken);

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.remove("hidden");
    loader.classList.add("flex");
  }
  return config;
});

// Hide loader and flatten ApiResponse
api.interceptors.response.use(
  (response) => {
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.classList.add("hidden");
      loader.classList.remove("flex");
    }

    // If backend sends ApiResponse format: { success, statusCode, message, data }
    // Flatten it so reducers still get flat object: response.data = { success, ...data, message }
    if (
      response.data &&
      response.data.success !== undefined &&
      response.data.data !== undefined
    ) {
      if (Array.isArray(response.data.data)) {
        response.data = {
          success: response.data.success,
          message: response.data.message,
          data: response.data.data,
        };
      } else {
        response.data = {
          success: response.data.success,
          message: response.data.message,
          ...response.data.data,
        };
      }
    }

    return response;
  },
  (error) => {
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.classList.add("hidden");
      loader.classList.remove("flex");
    }
    return Promise.reject(error);
  },
);

export default api;
