import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, updateProduct } from "../redux/adminProductSlice";
import { fetchAdminCategories } from "../../categories/redux/adminCategorySlice";
import { fetchAdminBrands } from "../../brands/redux/adminBrandSlice";
import { toast } from "react-toastify";
import { Package, ArrowLeft } from "lucide-react";
import ConfirmCreateProductModal from "../modal/ConfirmCreateProductModal";

const ProductForm = ({ product = null, onClose }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(product);
  const { categories } = useSelector((state) => state.adminCategory);
  const { brands } = useSelector((state) => state.adminBrand);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price != null ? String(product.price) : "",
    originalPrice:
      product?.originalPrice != null ? String(product.originalPrice) : "",
    category:
      typeof product?.category === "object"
        ? product.category._id
        : product?.category || "",
    gender: product?.gender || "Unisex",
    brand:
      typeof product?.brand === "object"
        ? product.brand._id
        : product?.brand || "",
    tags: Array.isArray(product?.tags)
      ? product.tags.join(", ")
      : product?.tags || "",
  });

  useEffect(() => {
    dispatch(fetchAdminCategories());
    dispatch(fetchAdminBrands());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category
    ) {
      return toast.error("Please fill in all required fields.");
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice
          ? Number(formData.originalPrice)
          : undefined,
        brand: formData.brand || undefined,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      if (isEditMode) {
        await dispatch(
          updateProduct({ id: product._id, productData: payload }),
        ).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast.success("Product created successfully!");
      }

      setIsConfirmModalOpen(false);
      onClose();
    } catch (error) {
      toast.error(
        error || `Failed to ${isEditMode ? "update" : "create"} product`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find(
    (c) => c._id === formData.category,
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111113] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <Package size={18} className="text-lime-400" />
          <h2 className="text-base font-semibold">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Air Jordan 1"
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 px-3.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description..."
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 px-3.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-lime-400/50 resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Price *
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 px-3.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Original Price
            </label>
            <input
              type="number"
              name="originalPrice"
              min="0"
              step="0.01"
              value={formData.originalPrice}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 px-3.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Category *
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 px-3.5 text-xs text-white outline-none focus:border-lime-400/50 appearance-none"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Brand
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 px-3.5 text-xs text-white outline-none focus:border-lime-400/50"
            >
              <option value="">Select a brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="running, lightweight, summer"
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 px-3.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 px-3.5 text-xs text-white outline-none focus:border-lime-400/50 appearance-none"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-2 text-xs font-semibold text-black transition hover:bg-lime-300"
          >
            {isEditMode ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmCreateProductModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        productData={formData}
        categoryName={selectedCategoryObj?.name}
        isSubmitting={isSubmitting}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default ProductForm;
