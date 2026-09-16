import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import {
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  Loader2,
  PlaySquare,
  Edit2,
  ExternalLink,
} from "lucide-react";

const StoriesAdmin = () => {
  const [stories, setStories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [storiesRes, productsRes] = await Promise.all([
        api.get("/story/admin"),
        api.get("/products?limit=100"), // get some products for dropdown
      ]);
      const fetchedStories =
        storiesRes.data?.stories ||
        (Array.isArray(storiesRes.data?.data) ? storiesRes.data.data : null) ||
        (Array.isArray(storiesRes.data) ? storiesRes.data : []);
      setStories(Array.isArray(fetchedStories) ? fetchedStories : []);

      const fetchedProducts =
        productsRes.data?.products ||
        (Array.isArray(productsRes.data?.data) ? productsRes.data.data : null) ||
        (Array.isArray(productsRes.data) ? productsRes.data : []);
      setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
    } catch (error) {
      toast.error("Failed to fetch stories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (story) => {
    setEditingStory(story);
    setIsAdding(false);
    setTitle(story.title || "");
    setSelectedProductId(story.product?._id || story.product || "");
    setIsActive(story.isActive !== false);
    setVideoFile(null);
    setThumbnailFile(null);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingStory(null);
    setTitle("");
    setVideoFile(null);
    setThumbnailFile(null);
    setSelectedProductId("");
    setIsActive(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      return toast.error("Story title is required.");
    }

    if (!editingStory && (!videoFile || !thumbnailFile)) {
      return toast.error("Title, video, and thumbnail are required.");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("product", selectedProductId || "");
      formData.append("isActive", isActive);

      if (videoFile) {
        formData.append("video", videoFile);
      }
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      if (editingStory) {
        await api.put(`/story/${editingStory._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Story updated successfully!");
      } else {
        await api.post("/story", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Story uploaded successfully!");
      }

      handleCancelForm();
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${editingStory ? "update" : "upload"} story`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      await api.delete(`/story/${id}`);
      toast.success("Story deleted successfully!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete story");
    }
  };

  if (isAdding || editingStory) {
    return (
      <div className="flex h-full w-full max-w-2xl mx-auto flex-col p-6 md:p-8 text-white">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <PlaySquare className="text-lime-400" />
          {editingStory ? "Edit Story" : "Upload New Story"}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white/5 p-6 rounded-xl border border-white/10"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Story Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Collection Drop"
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              {editingStory ? "Replace Video (Optional)" : "Video File"}
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-lime-400 file:text-black hover:file:bg-lime-300"
              required={!editingStory}
            />
            {editingStory?.video?.url && (
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                <span>Current video:</span>
                <a
                  href={editingStory.video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lime-400 hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink size={12} /> View Video
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              {editingStory ? "Replace Thumbnail (Optional)" : "Thumbnail Image"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-lime-400 file:text-black hover:file:bg-lime-300"
              required={!editingStory}
            />
            {editingStory?.thumbnail?.url && (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-zinc-400">Current thumbnail:</span>
                <img
                  src={editingStory.thumbnail.url}
                  alt="Current thumbnail"
                  className="h-10 w-10 rounded-lg object-cover border border-white/10"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Link Product (Optional)
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
            >
              <option value="">-- None --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-white/10">
            <div>
              <p className="text-sm font-medium text-zinc-300">Story Status</p>
              <p className="text-xs text-zinc-500">
                Display this story on the storefront
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
                  {editingStory ? "Saving..." : "Uploading..."}
                </>
              ) : editingStory ? (
                "Save Changes"
              ) : (
                "Upload Story"
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
            <PlaySquare className="text-lime-400" /> Manage Stories
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Upload and manage video stories for your storefront.
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
          Add Story
        </button>
      </div>

      <div className="flex-1 rounded-2xl border border-white/10 bg-[#111113] p-1">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center text-zinc-500">
            <Loader2 size={28} className="animate-spin text-lime-400" />
          </div>
        ) : !Array.isArray(stories) || stories.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-500 p-6 text-center">
            <Video size={40} className="mb-3 text-zinc-600" />
            <p className="text-base font-medium text-zinc-400">No stories found</p>
            <p className="text-sm mt-1">Get started by uploading a new video story.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-white">
              <thead className="bg-white/[0.03]">
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3.5 font-medium">Story</th>
                  <th className="px-5 py-3.5 font-medium">Linked Product</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(stories) &&
                  stories.map((story) => (
                    <tr
                      key={story._id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          {story.thumbnail?.url ? (
                            <img
                              src={story.thumbnail.url}
                              alt={story.title}
                              className="h-12 w-12 rounded-xl object-cover border border-white/10 bg-[#0c0c0d]"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c0c0d] border border-white/10 text-zinc-500">
                              <ImageIcon size={18} />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-white">
                              {story.title}
                            </p>
                            <a
                              href={story.video?.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-lime-400 hover:underline mt-0.5 inline-block"
                            >
                              View Video
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-300">
                        {story.product?.name || "None"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            story.isActive
                              ? "bg-lime-400/20 text-lime-400"
                              : "bg-red-400/20 text-red-400"
                          }`}
                        >
                          {story.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(story)}
                            className="p-2 rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition"
                            title="Edit Story"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(story._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                            title="Delete Story"
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

export default StoriesAdmin;
