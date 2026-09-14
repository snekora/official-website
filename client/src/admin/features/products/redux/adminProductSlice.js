import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../../services/api";

// ─── THUNKS ─────────────────────────────────────────────────────────

export const fetchAdminProducts = createAsyncThunk(
  "adminProduct/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      // The public endpoint handles basic fetching, searching, sorting and pagination
      const { data } = await api.get("/products", { params });
      return data; // contains products, count, total, page, totalPages
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "adminProduct/create",
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/products", productData);
      return data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "adminProduct/update",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/products/${id}`, productData);
      return data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "adminProduct/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

export const addVariant = createAsyncThunk(
  "adminProduct/addVariant",
  async ({ productId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/products/${productId}/variants`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add variant"
      );
    }
  }
);

export const updateVariant = createAsyncThunk(
  "adminProduct/updateVariant",
  async ({ productId, variantId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/products/${productId}/variants/${variantId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update variant"
      );
    }
  }
);

export const deleteVariant = createAsyncThunk(
  "adminProduct/deleteVariant",
  async ({ productId, variantId }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/products/${productId}/variants/${variantId}`);
      return data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete variant"
      );
    }
  }
);

// ─── SLICE ──────────────────────────────────────────────────────────

const adminProductSlice = createSlice({
  name: "adminProduct",
  initialState: {
    products: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchAdminProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(fetchAdminProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create
    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.products.unshift(action.payload);
      state.total += 1;
    });

    // Delete
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.products = state.products.filter((p) => p._id !== action.payload);
      state.total -= 1;
    });

    // Variants Update
    const handleUpdateProduct = (state, action) => {
      const index = state.products.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    };
    
    builder.addCase(updateProduct.fulfilled, handleUpdateProduct);
    builder.addCase(addVariant.fulfilled, handleUpdateProduct);
    builder.addCase(updateVariant.fulfilled, handleUpdateProduct);
    builder.addCase(deleteVariant.fulfilled, handleUpdateProduct);
  },
});

export default adminProductSlice.reducer;
