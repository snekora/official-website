import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  LayoutTemplate,
  Edit2,
} from "lucide-react";

const PosterAdmin = () => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoster, setEditingPoster] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [imageFile, setImageFile] = useState(null);
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const postersRes = await api.get("/poster/admin");
      
      const fetchedPosters =
        postersRes.data?.posters ||
        (Array.isArray(postersRes.data?.data) ? postersRes.data.data : null) ||
        (Array.isArray(postersRes.data) ? postersRes.data : []);
      setPosters(Array.isArray(fetchedPosters) ? fetchedPosters : []);
    } catch (error) {
      toast.error("Failed to fetch posters");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (poster) => {
    setEditingPoster(poster);
    setIsAdding(false);
    setOrder(poster.order || 0);
    setIsActive(poster.isActive !== false);
    setImageFile(null);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingPoster(null);
    setImageFile(null);
    setOrder(0);
    setIsActive(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingPoster && !imageFile) {
      return toast.error("Poster image is required.");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("order", order);
      formData.append("isActive", isActive);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingPoster) {
        await api.put(`/poster/${editingPoster._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Poster updated successfully!");
      } else {
        await api.post("/poster", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Poster created successfully!");
      }

      handleCancelForm();
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${editingPoster ? "update" : "create"} poster`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this poster?")) return;
    try {
      await api.delete(`/poster/${id}`);
      toast.success("Poster deleted successfully!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete poster");
    }
  };

  if (isAdding || editingPoster) {
    return (
      <div className="flex h-full flex-col p-6 md:p-8 text-white max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <LayoutTemplate className="text-lime-400" />
          {editingPoster ? "Edit Poster" : "Add New Poster"}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white/5 p-6 rounded-xl border border-white/10"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              {editingPoster ? "Replace Image (Optional)" : "Poster Image"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-lime-400 file:text-black hover:file:bg-lime-300"
              required={!editingPoster}
            />
            {editingPoster?.image?.url && (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-zinc-400">Current Image:</span>
                <img
                  src={editingPoster.image.url}
                  alt="Current poster"
                  className="h-20 w-auto rounded-lg object-cover border border-white/10"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
            />
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-white/10">
            <div>
              <p className="text-sm font-medium text-zinc-300">Poster Status</p>
              <p className="text-xs text-zinc-500">
                Display this poster on the storefront
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isActive ? "bg-lime-400" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleCancelForm}
              className="flex-1 rounded-lg bg-white/10 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-lime-400 py-2.5 text-sm font-semibold text-black hover:bg-lime-300 transition flex justify-center items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {editingPoster ? "Saving..." : "Creating..."}
                </>
              ) : editingPoster ? (
                "Save Changes"
              ) : (
                "Add Poster"
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
            <LayoutTemplate className="text-lime-400" /> Manage Posters
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Upload and manage hero banners for your storefront.
          </p>
        </div>
        <button
          onClick={() => {
            handleCancelForm();
            setIsAdding(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-2 text-xs font-semibold text-black transition hover:bg-lime-300"
        >
          <Plus size={16} />
          Add Poster
        </button>
      </div>

      <div className="flex-1 rounded-2xl border border-white/10 bg-[#111113] p-1">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center text-zinc-500">
            <Loader2 size={28} className="animate-spin text-lime-400" />
          </div>
        ) : !Array.isArray(posters) || posters.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-500 p-6 text-center">
            <ImageIcon size={40} className="mb-3 text-zinc-600" />
            <p className="text-base font-medium text-zinc-400">No posters found</p>
            <p className="text-sm mt-1">Get started by uploading a new hero banner.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-white">
              <thead className="bg-white/[0.03]">
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3.5 font-medium">Poster Image</th>
                  <th className="px-5 py-3.5 font-medium text-center">Order</th>
                  <th className="px-5 py-3.5 font-medium text-center">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(posters) &&
                  posters.map((poster) => (
                    <tr
                      key={poster._id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          {poster.image?.url ? (
                            <img
                              src={poster.image.url}
                              alt="Poster"
                              className="h-16 w-32 rounded-lg object-cover border border-white/10 bg-[#0c0c0d]"
                            />
                          ) : (
                            <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-[#0c0c0d] border border-white/10 text-zinc-500">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center text-xs text-zinc-300">
                        {poster.order}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            poster.isActive
                              ? "bg-lime-400/20 text-lime-400"
                              : "bg-red-400/20 text-red-400"
                          }`}
                        >
                          {poster.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(poster)}
                            className="p-2 rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition"
                            title="Edit Poster"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(poster._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                            title="Delete Poster"
                          >
                            <Trash2 size={16} />
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
    </div>
  );
};

export default PosterAdmin;