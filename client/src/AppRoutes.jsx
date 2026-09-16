import React from "react";
import Home from "./features/home/components/Home";
import UserLayout from "./layout/UserLayout";
import { Routes, Route } from "react-router-dom";
import ProductDetails from "./features/product/components/ProductDetails";
import ProductCatalog from "./features/product/components/productSearch/ProductCatalog";
import Cart from "./features/cart/components/Cart";
import Login from "./features/auth/components/Login";
import WishList from "./features/wishlist/components/WishList";
import Order from "./features/orders/components/Order";
import Profile from "./features/profile/components/Profile";
import Address from "./features/address/components/Address";
import PrivateRoute from "./components/PrivateRoute";
import GuestRoute from "./components/GuestRoute";
import AdminRoutes from "./AdminRoutes";
import ViewAllBrand from "./features/brand/components/ViewAllBrand";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="products" element={<ProductCatalog />} />
        <Route path="product/:slug" element={<ProductDetails />} />
        <Route path="products/:slug" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="brands" element={<ViewAllBrand />} />
        <Route path="categories" element={<ViewAllBrand />} />

        {/* Protected routes */}
        <Route
          path="wishlist"
          element={
            <PrivateRoute>
              <WishList />
            </PrivateRoute>
          }
        />
        {/* <Route path="orders" element={<PrivateRoute><Order /></PrivateRoute>} /> */}
        <Route
          path="profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="address"
          element={
            <PrivateRoute>
              <Address />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Guest-only route */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      {/* Admin routes */}
      <Route path="/mQ8vR2kX9Lp7N4/*" element={<AdminRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
