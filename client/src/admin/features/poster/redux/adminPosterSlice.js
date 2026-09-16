import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../../services/api";

// ─── THUNKS ─────────────────────────────────────────────────────────

export const fetchAdminPosters = createAsyncThunk(
  "adminPoster/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/poster/admin");
      return data.data?.posters || data.posters || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch posters"
      );
    }
  }
);

export const createPoster = createAsyncThunk(
  "adminPoster/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/poster", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data?.poster || data.poster;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create poster"
      );
    }
  }
);

export const updatePoster = createAsyncThunk(
  "adminPoster/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/poster/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data?.poster || data.poster;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update poster"
      );
    }
  }
);

export const deletePoster = createAsyncThunk(
  "adminPoster/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/poster/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete poster"
      );
    }
  }
);

// ─── SLICE ──────────────────────────────────────────────────────────

const adminPosterSlice = createSlice({
  name: "adminPoster",
  initialState: {
    posters: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchAdminPosters.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminPosters.fulfilled, (state, action) => {
      state.loading = false;
      state.posters = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(fetchAdminPosters.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create
    builder.addCase(createPoster.fulfilled, (state, action) => {
      if (action.payload) {
        state.posters.unshift(action.payload);
      }
    });

    // Update
    builder.addCase(updatePoster.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.posters.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.posters[index] = action.payload;
        }
      }
    });

    // Delete
    builder.addCase(deletePoster.fulfilled, (state, action) => {
      state.posters = state.posters.filter((p) => p._id !== action.payload);
    });
  },
});

export default adminPosterSlice.reducer;
