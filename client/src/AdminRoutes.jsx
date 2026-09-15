import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./admin/layout/AdminLayout";
import Login from "./admin/features/auth/components/Login";
import Products from "./admin/features/products/components/products";
import Poster from "./admin/features/poster/components/Poster";
import Home from "./admin/features/home/Home";
import AdminPrivateRoute from "./admin/components/AdminPrivateRoute";
import ManageAdmins from "./admin/features/auth/components/ManageAdmins";

import StoriesAdmin from "./admin/features/stories/components/StoriesAdmin";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="/"
        element={
          <AdminPrivateRoute>
            <AdminLayout />
          </AdminPrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="poster" element={<Poster />} />
        <Route path="stories" element={<StoriesAdmin />} />
        <Route path="manage" element={<ManageAdmins />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
