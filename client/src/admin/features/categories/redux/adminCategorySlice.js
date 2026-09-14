import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../../services/api";

// ─── THUNKS ─────────────────────────────────────────────────────────

export const fetchAdminCategories = createAsyncThunk(
  "adminCategory/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/categories/admin/all");
      return data.categories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "adminCategory/create",
  async (categoryData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/categories", categoryData);
      return data.category;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "adminCategory/update",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/categories/${id}`, categoryData);
      return data.category;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "adminCategory/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

export const toggleCategoryStatus = createAsyncThunk(
  "adminCategory/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/categories/${id}/toggle`);
      return data.category;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle category status"
      );
    }
  }
);

// ─── SLICE ──────────────────────────────────────────────────────────

const adminCategorySlice = createSlice({
  name: "adminCategory",
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchAdminCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchAdminCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.categories.unshift(action.payload);
    });

    // Update & Toggle Status
    const handleUpdate = (state, action) => {
      const index = state.categories.findIndex(
        (c) => c._id === action.payload._id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    };
    builder.addCase(updateCategory.fulfilled, handleUpdate);
    builder.addCase(toggleCategoryStatus.fulfilled, handleUpdate);

    // Delete
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.categories = state.categories.filter((c) => c._id !== action.payload);
    });
  },
});

export default adminCategorySlice.reducer;
