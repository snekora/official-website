import React, { useState } from "react";
import CategoryManager from "../../categories/components/CategoryManager";
import BrandManager from "../../brands/components/BrandManager";
import ProductManager from "./ProductManager";
import { Package, FolderOpen, Tag } from "lucide-react";

const Products = () => {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="flex h-full flex-col p-6 md:p-8">
      {/* Header & Tabs */}
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Inventory Management
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Manage your products, categories, and brands.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex w-fit items-center rounded-xl bg-white/5 p-1 border border-white/10">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === "products"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Package size={15} />
            Products
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === "categories"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FolderOpen size={15} />
            Categories
          </button>
          <button
            onClick={() => setActiveTab("brands")}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === "brands"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Tag size={15} />
            Brands
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === "products" ? (
          <ProductManager />
        ) : activeTab === "categories" ? (
          <CategoryManager />
        ) : (
          <BrandManager />
        )}
      </div>
    </div>
  );
};

export default Products;