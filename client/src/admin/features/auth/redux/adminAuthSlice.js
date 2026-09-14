import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../../services/api";

const safeJSONParse = (item) => {
  if (!item || item === "undefined") return null;
  try {
    return JSON.parse(item);
  } catch (e) {
    return null;
  }
};

const savedAdmin = localStorage.getItem("admin");
const savedAdminToken = localStorage.getItem("admin_token");

const initialState = {
  admin: safeJSONParse(savedAdmin),
  token: savedAdminToken || null,
  loading: false,
  error: null,
  isAuthenticated: !!safeJSONParse(savedAdmin),
  sessionChecked: false,
  adminsList: [],
};

/**
 * Admin login via username & password.
 */
export const adminLogin = createAsyncThunk(
  "adminAuth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/admin/login", {
        username,
        password,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Admin login failed",
      );
    }
  },
);

/**
 * Checks if the admin has an active session by calling GET /api/auth/admin/me.
 * The HTTP-only cookie is sent automatically by the browser.
 */
export const checkAdminAuth = createAsyncThunk(
  "adminAuth/checkAuth",
  async (_, { rejectWithValue }) => {
    if (!localStorage.getItem("admin")) {
      return rejectWithValue("No active admin session");
    }
    try {
      const { data } = await api.get("/auth/admin/me");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Admin session expired",
      );
    }
  },
);

/**
 * Logs out the admin by calling POST /api/auth/admin/logout to clear the cookie.
 */
export const adminLogout = createAsyncThunk(
  "adminAuth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/admin/logout");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Admin logout failed",
      );
    }
  },
);

/**
 * Register a new admin account (requires the registration secret).
 */
export const registerAdmin = createAsyncThunk(
  "adminAuth/register",
  async ({ username, password, secret }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/admin/register", {
        username,
        password,
        secret,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Admin registration failed",
      );
    }
  },
);

/**
 * Fetch all admins.
 */
export const fetchAdmins = createAsyncThunk(
  "adminAuth/fetchAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/admin");
      return data.admins;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admins",
      );
    }
  },
);

/**
 * Delete an admin by ID.
 */
export const removeAdmin = createAsyncThunk(
  "adminAuth/removeAdmin",
  async (adminId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/auth/admin/${adminId}`);
      return data.admin; // Return deleted admin
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete admin",
      );
    }
  },
);

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── login ──
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.admin;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
        state.sessionChecked = true;
        localStorage.setItem("admin", JSON.stringify(action.payload.admin));
        if (action.payload.token) {
          localStorage.setItem("admin_token", action.payload.token);
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ── checkAdminAuth (session persistence) ──
      .addCase(checkAdminAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAdminAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.admin;
        state.isAuthenticated = true;
        state.sessionChecked = true;
        localStorage.setItem("admin", JSON.stringify(action.payload.admin));
      })
      .addCase(checkAdminAuth.rejected, (state) => {
        state.loading = false;
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
        state.sessionChecked = true;
        localStorage.removeItem("admin");
        localStorage.removeItem("admin_token");
      })
      // ── logout ──
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null;
        state.token = null;
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
        localStorage.removeItem("admin");
        localStorage.removeItem("admin_token");
      })
      .addCase(adminLogout.rejected, (state) => {
        // Even if the server fails, log them out locally
        state.admin = null;
        state.token = null;
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
        localStorage.removeItem("admin");
        localStorage.removeItem("admin_token");
      })
      // ── fetchAdmins ──
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.adminsList = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ── removeAdmin ──
      .addCase(removeAdmin.fulfilled, (state, action) => {
        state.adminsList = state.adminsList.filter(
          (a) => a._id !== action.payload._id,
        );
      });
  },
});

export default adminAuthSlice.reducer;
