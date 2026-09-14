import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Show loader
api.interceptors.request.use((config) => {
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
      response.data = {
        success: response.data.success,
        message: response.data.message,
        ...response.data.data,
      };
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
