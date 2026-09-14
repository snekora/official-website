import React, { useState, useEffect } from "react";
import { Tag, Loader2, X, Check } from "lucide-react";
import { toast } from "react-toastify";

const EditBrandModal = ({
  isOpen,
  onClose,
  onConfirm,
  brandData,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    if (isOpen && brandData) {
      setFormData({
        name: brandData.name || "",
        description: brandData.description || "",
      });
      setLogoPreview(
        typeof brandData.logo === "object" ? brandData.logo?.url : brandData.logo
      );
      setLogoFile(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, brandData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Brand name is required");
    
    const submitData = new FormData();
    submitData.append("name", formData.name);
    if (formData.description) submitData.append("description", formData.description);
    if (logoFile) submitData.append("logo", logoFile);

    onConfirm(submitData);
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
            <Tag size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Edit Brand</h3>
            <p className="text-xs text-zinc-400">Update brand details</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Brand Name
            </label>
            <div className="relative">
              <Tag
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Nike, Adidas"
                className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 pl-9 pr-3.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Logo Image
            </label>
            <div className="relative">
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2 pl-3 pr-3.5 text-xs text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-lime-400/10 file:px-2.5 file:py-1 file:text-[11px] file:font-semibold file:text-lime-400 hover:file:bg-lime-400/20 outline-none focus:border-lime-400/50 cursor-pointer transition"
              />
            </div>
            {logoPreview && (
              <div className="mt-2.5 flex items-center gap-3 p-2 rounded-xl border border-white/10 bg-white/5">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-10 w-10 rounded-lg object-contain bg-black/40 border border-white/10 p-1"
                />
                <span className="text-xs text-zinc-300 font-medium truncate flex-1">
                  {logoFile ? logoFile.name : "Current Logo"}
                </span>
                {logoFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(
                        typeof brandData.logo === "object"
                          ? brandData.logo?.url
                          : brandData.logo
                      );
                    }}
                    className="text-zinc-400 hover:text-red-400 text-xs p-1 transition"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
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

export default EditBrandModal;
