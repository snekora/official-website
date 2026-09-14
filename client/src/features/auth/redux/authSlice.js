import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../services/api";

const safeJSONParse = (item) => {
  if (!item || item === "undefined") return null;
  try {
    return JSON.parse(item);
  } catch (e) {
    return null;
  }
};

const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");

const initialState = {
  user: safeJSONParse(savedUser),
  token: savedToken || null,
  loading: false,
  error: null,
  isAuthenticated: !!safeJSONParse(savedUser),
  sessionChecked: false,
};

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/google", { code });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Google login failed",
      );
    }
  },
);

/**
 * Checks if the user has an active session by calling GET /api/auth/me.
 * The HTTP-only cookie is sent automatically by the browser.
 */
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    if (!localStorage.getItem("user")) {
      return rejectWithValue("No active session");
    }
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Session expired",
      );
    }
  },
);

/**
 * Logs out the user by calling POST /api/auth/logout to clear the cookie.
 */
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/logout");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Logout failed",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
        state.sessionChecked = true;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ── checkAuth (session persistence) ──
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.sessionChecked = true;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.sessionChecked = true;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      // ── logout ──
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(logout.rejected, (state) => {
        // Even if the server fails, log them out locally
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      });
  },
});

export default authSlice.reducer;
