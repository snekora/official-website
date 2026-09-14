import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;
