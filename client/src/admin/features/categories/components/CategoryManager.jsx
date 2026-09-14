import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../redux/adminCategorySlice";
import { toast } from "react-toastify";
import {
  FolderPlus,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  FolderOpen,
  Edit2,
} from "lucide-react";
import ConfirmCreateCategoryModal from "../modal/ConfirmCreateCategoryModal";
import ConfirmDeleteCategoryModal from "../modal/ConfirmDeleteCategoryModal";
import EditCategoryModal from "../modal/EditCategoryModal";

const CategoryManager = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.adminCategory);

  const [formData, setFormData] = useState({ name: "" });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null); // { id, name }
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open creation confirmation modal when form submitted
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Category name is required");
    setIsConfirmModalOpen(true);
  };

  // Dispatch API call when confirmed in creation modal
  const handleConfirmCreate = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(createCategory(formData)).unwrap();
      toast.success("Category created successfully!");
      setFormData({ name: "" });
      setIsConfirmModalOpen(false);
    } catch (error) {
      toast.error(error || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (category) => {
    setCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = async (submitData) => {
    if (!categoryToEdit) return;
    setIsSubmitting(true);
    try {
      await dispatch(
        updateCategory({ id: categoryToEdit._id, categoryData: submitData })
      ).unwrap();
      toast.success("Category updated successfully!");
      setIsEditModalOpen(false);
      setCategoryToEdit(null);
    } catch (error) {
      toast.error(error || "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setProcessingId(id);
    try {
      await dispatch(toggleCategoryStatus(id)).unwrap();
      toast.success("Category status updated!");
    } catch (error) {
      toast.error(error || "Failed to update category status");
    } finally {
      setProcessingId(null);
    }
  };

  // Open deletion confirmation modal
  const handleDeleteClick = (id, name) => {
    setCategoryToDelete({ id, name });
  };

  // Dispatch API call when confirmed in deletion modal
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteCategory(categoryToDelete.id)).unwrap();
      toast.success("Category deleted successfully!");
      setCategoryToDelete(null);
    } catch (error) {
      toast.error(error || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      {/* Left: Create Form */}
      <div className="rounded-2xl border border-white/10 bg-[#111113] p-5 h-fit">
        <div className="flex items-center gap-2 mb-4 text-white">
          <FolderPlus size={16} className="text-lime-400" />
          <h2 className="text-sm font-semibold">New Category</h2>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3.5">
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



          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-3.5 py-2.5 text-xs font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FolderPlus size={15} />
            Create Category
          </button>
        </form>
      </div>

      {/* Right: Category List */}
      <div className="rounded-2xl border border-white/10 bg-[#111113] p-5">
        <div className="flex items-center gap-2 mb-4 text-white">
          <FolderOpen size={16} className="text-lime-400" />
          <h2 className="text-sm font-semibold">Active Categories</h2>
        </div>

        {loading && categories.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-zinc-500">
            <Loader2 size={24} className="animate-spin text-lime-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-500">
            <p className="text-xs">No categories found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-white">
              <thead className="bg-white/[0.03]">
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400">
                          <FolderOpen size={14} />
                        </div>
                        <p className="text-xs font-medium">{cat.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400">
                      /{cat.slug}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                          cat.isActive
                            ? "bg-lime-400/10 text-lime-400"
                            : "bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(cat._id)}
                          disabled={processingId === cat._id}
                          className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
                          title={cat.isActive ? "Deactivate" : "Activate"}
                        >
                          {processingId === cat._id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : cat.isActive ? (
                            <PowerOff size={15} />
                          ) : (
                            <Power size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditClick(cat)}
                          disabled={processingId === cat._id}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat._id, cat.name)}
                          disabled={processingId === cat._id}
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
      <ConfirmCreateCategoryModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmCreate}
        categoryData={formData}
        isSubmitting={isSubmitting}
      />

      {/* Deletion Confirmation Modal */}
      <ConfirmDeleteCategoryModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        categoryName={categoryToDelete?.name || ""}
        isDeleting={isDeleting}
      />

      {/* Edit Modal */}
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleConfirmEdit}
        categoryData={categoryToEdit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CategoryManager;
