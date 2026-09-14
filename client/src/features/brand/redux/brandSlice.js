import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../services/api";

export const fetchBrands = createAsyncThunk(
  "brand/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/brands");
      return data.brands;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands"
      );
    }
  }
);

const brandSlice = createSlice({
  name: "brand",
  initialState: {
    brands: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default brandSlice.reducer;
