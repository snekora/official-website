import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../services/api";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/cart");
      return data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, variantId, size, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/cart", {
        productId,
        variantId,
        size,
        quantity,
      });
      return data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to cart"
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      return data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart item"
      );
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      return data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove item from cart"
      );
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete("/cart");
      return data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear cart"
      );
    }
  }
);

const initialState = {
  cart: { items: [] },
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload || { items: [] };
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Remove Item
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Clear Cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
