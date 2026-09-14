import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../../services/api";

// ─── THUNKS ─────────────────────────────────────────────────────────

export const fetchAdminBrands = createAsyncThunk(
  "adminBrand/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/brands/admin/all");
      return data.brands;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands"
      );
    }
  }
);

export const createBrand = createAsyncThunk(
  "adminBrand/create",
  async (brandData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/brands", brandData);
      return data.brand;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create brand"
      );
    }
  }
);

export const updateBrand = createAsyncThunk(
  "adminBrand/update",
  async ({ id, brandData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/brands/${id}`, brandData);
      return data.brand;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update brand"
      );
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "adminBrand/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/brands/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete brand"
      );
    }
  }
);

export const toggleBrandStatus = createAsyncThunk(
  "adminBrand/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/brands/${id}/toggle`);
      return data.brand;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle brand status"
      );
    }
  }
);

// ─── SLICE ──────────────────────────────────────────────────────────

const adminBrandSlice = createSlice({
  name: "adminBrand",
  initialState: {
    brands: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchAdminBrands.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminBrands.fulfilled, (state, action) => {
      state.loading = false;
      state.brands = action.payload;
    });
    builder.addCase(fetchAdminBrands.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create
    builder.addCase(createBrand.fulfilled, (state, action) => {
      state.brands.unshift(action.payload);
    });

    // Update & Toggle Status
    const handleUpdate = (state, action) => {
      const index = state.brands.findIndex(
        (b) => b._id === action.payload._id
      );
      if (index !== -1) {
        state.brands[index] = action.payload;
      }
    };
    builder.addCase(updateBrand.fulfilled, handleUpdate);
    builder.addCase(toggleBrandStatus.fulfilled, handleUpdate);

    // Delete
    builder.addCase(deleteBrand.fulfilled, (state, action) => {
      state.brands = state.brands.filter((b) => b._id !== action.payload);
    });
  },
});

export default adminBrandSlice.reducer;
