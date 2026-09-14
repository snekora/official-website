import React, { useState, useEffect } from "react";
import { FolderOpen, Loader2, X, Check } from "lucide-react";
import { toast } from "react-toastify";

const EditCategoryModal = ({
  isOpen,
  onClose,
  onConfirm,
  categoryData,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    if (isOpen && categoryData) {
      setFormData({
        name: categoryData.name || "",
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, categoryData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Category name is required");
    onConfirm(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#111113] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
            <FolderOpen size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Edit Category</h3>
            <p className="text-xs text-zinc-400">Update category details</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Category Name
            </label>
            <div className="relative">
              <FolderOpen
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sneakers"
                className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 pl-9 pr-3.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
