import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../services/api";

export const fetchPublicProducts = createAsyncThunk(
  "product/fetchPublic",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/products", { params });
      return data; // contains products, currentPage, totalPages, totalProducts, limit
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchSearchSuggestions = createAsyncThunk(
  "product/fetchSuggestions",
  async (query, { rejectWithValue }) => {
    if (!query) return [];
    try {
      const { data } = await api.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
      return data.suggestions;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch suggestions"
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product details"
      );
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    totalProducts: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 20,
    loading: false,
    error: null,
    
    suggestions: [],
    suggestionsLoading: false,
    
    currentProduct: null,
    currentProductLoading: false,
    currentProductError: null,
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductError = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch multiple products
    builder.addCase(fetchPublicProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPublicProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.products || [];
      state.totalProducts = action.payload.totalProducts || 0;
      state.currentPage = action.payload.currentPage || 1;
      state.totalPages = action.payload.totalPages || 1;
      state.limit = action.payload.limit || 20;
    });
    builder.addCase(fetchPublicProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch single product
    builder.addCase(fetchProductById.pending, (state) => {
      state.currentProductLoading = true;
      state.currentProductError = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.currentProductLoading = false;
      state.currentProduct = action.payload;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.currentProductLoading = false;
      state.currentProductError = action.payload;
    });

    // Fetch Suggestions
    builder.addCase(fetchSearchSuggestions.pending, (state) => {
      state.suggestionsLoading = true;
    });
    builder.addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
      state.suggestionsLoading = false;
      state.suggestions = action.payload || [];
    });
    builder.addCase(fetchSearchSuggestions.rejected, (state) => {
      state.suggestionsLoading = false;
      state.suggestions = [];
    });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
