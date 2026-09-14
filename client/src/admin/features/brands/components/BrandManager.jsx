import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
} from "../redux/adminBrandSlice";
import { toast } from "react-toastify";
import {
  Tag,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  Image as ImageIcon,
  Edit2,
} from "lucide-react";
import ConfirmCreateBrandModal from "../modal/ConfirmCreateBrandModal";
import ConfirmDeleteBrandModal from "../modal/ConfirmDeleteBrandModal";
import EditBrandModal from "../modal/EditBrandModal";

const BrandManager = () => {
  const dispatch = useDispatch();
  const { brands, loading } = useSelector((state) => state.adminBrand);

  const [formData, setFormData] = useState({ name: "", logo: null, description: "" });
  const [logoPreview, setLogoPreview] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null); // { id, name }
  const [brandToEdit, setBrandToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminBrands());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Brand name is required");
    if (!formData.logo) return toast.error("Brand logo image is required");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      if (formData.description) submitData.append("description", formData.description);
      if (formData.logo) submitData.append("logo", formData.logo);

      await dispatch(createBrand(submitData)).unwrap();
      toast.success("Brand created successfully!");
      setFormData({ name: "", logo: null, description: "" });
      setLogoPreview(null);
      setIsConfirmModalOpen(false);
    } catch (error) {
      toast.error(error || "Failed to create brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (brand) => {
    setBrandToEdit(brand);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = async (submitData) => {
    if (!brandToEdit) return;
    setIsSubmitting(true);
    try {
      await dispatch(
        updateBrand({ id: brandToEdit._id, brandData: submitData })
      ).unwrap();
      toast.success("Brand updated successfully!");
      setIsEditModalOpen(false);
      setBrandToEdit(null);
    } catch (error) {
      toast.error(error || "Failed to update brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setProcessingId(id);
    try {
      await dispatch(toggleBrandStatus(id)).unwrap();
      toast.success("Brand status updated!");
    } catch (error) {
      toast.error(error || "Failed to update brand status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteClick = (id, name) => {
    setBrandToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBrand(brandToDelete.id)).unwrap();
      toast.success("Brand deleted successfully!");
      setBrandToDelete(null);
    } catch (error) {
      toast.error(error || "Failed to delete brand");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      {/* Left: Create Form */}
      <div className="rounded-2xl border border-white/10 bg-[#111113] p-5 h-fit">
        <div className="flex items-center gap-2 mb-4 text-white">
          <Plus size={16} className="text-lime-400" />
          <h2 className="text-sm font-semibold">New Brand</h2>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3.5">
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
              Logo Image (Required) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                name="logo"
                required
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
                  {formData.logo?.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, logo: null });
                    setLogoPreview(null);
                  }}
                  className="text-zinc-400 hover:text-red-400 text-xs p-1 transition"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-3.5 py-2.5 text-xs font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={15} />
            Create Brand
          </button>
        </form>
      </div>

      {/* Right: Brand List */}
      <div className="rounded-2xl border border-white/10 bg-[#111113] p-5">
        <div className="flex items-center gap-2 mb-4 text-white">
          <Tag size={16} className="text-lime-400" />
          <h2 className="text-sm font-semibold">Active Brands</h2>
        </div>

        {loading && brands.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-zinc-500">
            <Loader2 size={24} className="animate-spin text-lime-400" />
          </div>
        ) : brands.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-500">
            <p className="text-xs">No brands found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-white">
              <thead className="bg-white/[0.03]">
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3 font-medium">Brand</th>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr
                    key={b._id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {b.logo ? (
                          <img
                            src={typeof b.logo === "object" ? b.logo?.url : b.logo}
                            alt={b.name}
                            className="h-8 w-8 rounded-xl object-contain bg-white/5 border border-white/10 p-1"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400">
                            <Tag size={14} />
                          </div>
                        )}
                        <p className="text-xs font-medium">{b.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400">
                      /{b.slug}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                          b.isActive
                            ? "bg-lime-400/10 text-lime-400"
                            : "bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(b._id)}
                          disabled={processingId === b._id}
                          className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
                          title={b.isActive ? "Deactivate" : "Activate"}
                        >
                          {processingId === b._id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : b.isActive ? (
                            <PowerOff size={15} />
                          ) : (
                            <Power size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditClick(b)}
                          disabled={processingId === b._id}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(b._id, b.name)}
                          disabled={processingId === b._id}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Confirmation Modal */}
      <ConfirmCreateBrandModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmCreate}
        brandData={{ ...formData, logoPreview }}
        isSubmitting={isSubmitting}
      />

      {/* Deletion Confirmation Modal */}
      <ConfirmDeleteBrandModal
        isOpen={Boolean(brandToDelete)}
        onClose={() => setBrandToDelete(null)}
        onConfirm={handleConfirmDelete}
        brandName={brandToDelete?.name || ""}
        isDeleting={isDeleting}
      />

      {/* Edit Modal */}
      <EditBrandModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleConfirmEdit}
        brandData={brandToEdit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default BrandManager;
