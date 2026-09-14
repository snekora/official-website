import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../services/api";

export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/address");
      return data.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch addresses");
    }
  }
);

export const addAddress = createAsyncThunk(
  "address/addAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/address", addressData);
      return data.address;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add address");
    }
  }
);

export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, data: addressData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/address/${id}`, addressData);
      return res.data.address;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update address");
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/address/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete address");
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "address/setDefaultAddress",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.patch(`/address/${id}/default`);
      // Since setting a default address unsets the others on the backend, we can just refetch them all or update locally. 
      // It's cleaner to update locally.
      return data.address;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to set default address");
    }
  }
);

const initialState = {
  addresses: [],
  loading: false,
  error: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addAddress.fulfilled, (state, action) => {
        if (action.payload.isDefault) {
          state.addresses.forEach(a => { a.isDefault = false; });
        }
        state.addresses.unshift(action.payload);
      })
      // Update
      .addCase(updateAddress.fulfilled, (state, action) => {
        if (action.payload.isDefault) {
          state.addresses.forEach(a => { a.isDefault = false; });
        }
        const index = state.addresses.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteAddress.fulfilled, (state, action) => {
        const deletedId = action.payload;
        const deletedAddress = state.addresses.find(a => a._id === deletedId);
        state.addresses = state.addresses.filter(a => a._id !== deletedId);
        
        // If we deleted the default, the backend might have made another one default. 
        // We'll mark the first one as default optimistically if there are any left.
        if (deletedAddress?.isDefault && state.addresses.length > 0) {
            state.addresses[0].isDefault = true;
        }
      })
      // Set Default
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addresses.forEach(a => { a.isDefault = false; });
        const index = state.addresses.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.addresses[index].isDefault = true;
        }
      });
  }
});

export default addressSlice.reducer;
