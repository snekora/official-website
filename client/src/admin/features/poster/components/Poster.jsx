import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchAdminPosters,
  createPoster,
  updatePoster,
  deletePoster,
} from "../redux/adminPosterSlice";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  LayoutTemplate,
  Edit2,
  Monitor,
  Smartphone,
} from "lucide-react";

const PosterAdmin = () => {
  const dispatch = useDispatch();
  const { posters, loading } = useSelector((state) => state.adminPoster);

  const [isAdding, setIsAdding] = useState(false);
  const [editingPoster, setEditingPoster] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [desktopImageFile, setDesktopImageFile] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    dispatch(fetchAdminPosters());
  }, [dispatch]);

  const handleEdit = (poster) => {
    setEditingPoster(poster);
    setIsAdding(false);
    setOrder(poster.order || 0);
    setIsActive(poster.isActive !== false);
    setDesktopImageFile(null);
    setMobileImageFile(null);
    setDesktopPreview(null);
    setMobilePreview(null);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingPoster(null);
    setDesktopImageFile(null);
    setMobileImageFile(null);
    setDesktopPreview(null);
    setMobilePreview(null);
    setOrder(0);
    setIsActive(true);
  };

  const handleDesktopFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesktopImageFile(file);
      setDesktopPreview(URL.createObjectURL(file));
    }
  };

  const handleMobileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileImageFile(file);
      setMobilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingPoster && !desktopImageFile && !mobileImageFile) {
      return toast.error("Please upload at least one poster image.");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("order", order);
      formData.append("isActive", isActive);

      if (desktopImageFile) {
        formData.append("desktopImage", desktopImageFile);
      }
      if (mobileImageFile) {
        formData.append("mobileImage", mobileImageFile);
      }

      if (editingPoster) {
        await dispatch(
          updatePoster({ id: editingPoster._id, formData })
        ).unwrap();
        toast.success("Poster updated successfully!");
      } else {
        await dispatch(createPoster(formData)).unwrap();
        toast.success("Poster created successfully!");
      }

      handleCancelForm();
    } catch (error) {
      toast.error(error || `Failed to ${editingPoster ? "update" : "create"} poster`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this poster?")) return;
    try {
      await dispatch(deletePoster(id)).unwrap();
      toast.success("Poster deleted successfully!");
    } catch (error) {
      toast.error(error || "Failed to delete poster");
    }
  };

  if (isAdding || editingPoster) {
    return (
      <div className="flex h-full w-full max-w-2xl mx-auto flex-col p-6 md:p-8 text-white">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <LayoutTemplate className="text-lime-400" />
          {editingPoster ? "Edit Poster" : "Add New Poster"}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10"
        >
          {/* Desktop Banner Upload (21:9) */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Monitor size={18} className="text-lime-400" />
                <span>Desktop Poster Image</span>
              </div>
              <span className="rounded bg-lime-400/20 px-2 py-0.5 text-[11px] font-bold text-lime-400 tracking-wider">
                21:9 Aspect Ratio
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Recommended resolution: <strong className="text-zinc-200">2560 × 1080 px</strong> or <strong className="text-zinc-200">1920 × 820 px</strong> (Ultrawide format).
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleDesktopFileChange}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-lime-400 file:text-black hover:file:bg-lime-300 cursor-pointer"
            />
            {desktopPreview ? (
              <div className="mt-2 space-y-1">
                <span className="text-xs text-zinc-400">New Desktop Preview:</span>
                <div className="aspect-[21/9] w-full rounded-lg overflow-hidden border border-lime-400/40 bg-black">
                  <img
                    src={desktopPreview}
                    alt="Desktop Preview"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            ) : (editingPoster?.desktopImage?.url || editingPoster?.image?.url) ? (
              <div className="mt-2 space-y-1">
                <span className="text-xs text-zinc-400">Current Desktop Poster:</span>
                <div className="aspect-[21/9] w-full rounded-lg overflow-hidden border border-white/10 bg-black">
                  <img
                    src={editingPoster.desktopImage?.url || editingPoster.image?.url}
                    alt="Current Desktop Poster"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Mobile Banner Upload (16:9) */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Smartphone size={18} className="text-lime-400" />
                <span>Mobile Poster Image</span>
              </div>
              <span className="rounded bg-lime-400/20 px-2 py-0.5 text-[11px] font-bold text-lime-400 tracking-wider">
                16:9 Aspect Ratio
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Recommended resolution: <strong className="text-zinc-200">1920 × 1080 px</strong> or <strong className="text-zinc-200">1080 × 608 px</strong> (Standard widescreen format).
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleMobileFileChange}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-lime-400 file:text-black hover:file:bg-lime-300 cursor-pointer"
            />
            {mobilePreview ? (
              <div className="mt-2 space-y-1">
                <span className="text-xs text-zinc-400">New Mobile Preview:</span>
                <div className="aspect-[16/9] w-64 rounded-lg overflow-hidden border border-lime-400/40 bg-black">
                  <img
                    src={mobilePreview}
                    alt="Mobile Preview"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            ) : (editingPoster?.mobileImage?.url || editingPoster?.image?.url) ? (
              <div className="mt-2 space-y-1">
                <span className="text-xs text-zinc-400">Current Mobile Poster:</span>
                <div className="aspect-[16/9] w-64 rounded-lg overflow-hidden border border-white/10 bg-black">
                  <img
                    src={editingPoster.mobileImage?.url || editingPoster.image?.url}
                    alt="Current Mobile Poster"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            ) : null}
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
    <div className="flex h-full w-full max-w-7xl mx-auto flex-col p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
            <LayoutTemplate className="text-lime-400" /> Manage Posters
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Upload and manage responsive hero banners (Desktop 21:9 and Mobile 16:9) for your storefront.
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
                  <th className="px-5 py-3.5 font-medium">Desktop (21:9)</th>
                  <th className="px-5 py-3.5 font-medium">Mobile (16:9)</th>
                  <th className="px-5 py-3.5 font-medium text-center">Order</th>
                  <th className="px-5 py-3.5 font-medium text-center">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(posters) &&
                  posters.map((poster) => {
                    const desktopSrc = poster.desktopImage?.url || poster.image?.url;
                    const mobileSrc = poster.mobileImage?.url || poster.image?.url;

                    return (
                      <tr
                        key={poster._id}
                        className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition"
                      >
                        <td className="px-5 py-4">
                          {desktopSrc ? (
                            <img
                              src={desktopSrc}
                              alt="Desktop Poster"
                              className="h-12 w-28 rounded-lg object-cover border border-white/10 bg-[#0c0c0d]"
                            />
                          ) : (
                            <div className="flex h-12 w-28 items-center justify-center rounded-lg bg-[#0c0c0d] border border-white/10 text-zinc-500 text-[10px]">
                              No Desktop Image
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {mobileSrc ? (
                            <img
                              src={mobileSrc}
                              alt="Mobile Poster"
                              className="h-12 w-20 rounded-lg object-cover border border-white/10 bg-[#0c0c0d]"
                            />
                          ) : (
                            <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-[#0c0c0d] border border-white/10 text-zinc-500 text-[10px]">
                              No Mobile Image
                            </div>
                          )}
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
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PosterAdmin;