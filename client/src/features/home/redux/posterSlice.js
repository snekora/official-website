import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../services/api";

export const fetchPublicPosters = createAsyncThunk(
  "poster/fetchPublic",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/poster");
      return data.data?.posters || data.posters || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch posters"
      );
    }
  }
);

const posterSlice = createSlice({
  name: "poster",
  initialState: {
    posters: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicPosters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicPosters.fulfilled, (state, action) => {
        state.loading = false;
        state.posters = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPublicPosters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default posterSlice.reducer;
