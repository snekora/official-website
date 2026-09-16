import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/redux/authSlice";
import addressReducer from "../features/address/redux/addressSlice";
import adminAuthReducer from "../admin/features/auth/redux/adminAuthSlice";
import adminCategoryReducer from "../admin/features/categories/redux/adminCategorySlice";
import adminBrandReducer from "../admin/features/brands/redux/adminBrandSlice";
import adminProductReducer from "../admin/features/products/redux/adminProductSlice";
import adminPosterReducer from "../admin/features/poster/redux/adminPosterSlice";
import productReducer from "../features/product/redux/productSlice";
import brandReducer from "../features/brand/redux/brandSlice";
import cartReducer from "../features/cart/redux/cartSlice";
import posterReducer from "../features/home/redux/posterSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    address: addressReducer,
    adminAuth: adminAuthReducer,
    adminCategory: adminCategoryReducer,
    adminBrand: adminBrandReducer,
    adminProduct: adminProductReducer,
    adminPoster: adminPosterReducer,
    product: productReducer,
    brand: brandReducer,
    cart: cartReducer,
    poster: posterReducer,
  },
});
