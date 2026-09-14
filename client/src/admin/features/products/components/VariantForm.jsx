import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addVariant, updateVariant } from "../redux/adminProductSlice";
import { toast } from "react-toastify";
import { ArrowLeft, Image as ImageIcon, X, Plus } from "lucide-react";
import ConfirmSaveVariantModal from "../modal/ConfirmSaveVariantModal";

const VariantForm = ({ product, initialData, onClose }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Form State
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [sizes, setSizes] = useState([]);

  // Images State
  const [existingImages, setExistingImages] = useState([]); // Array of existing image objects
  const [newImages, setNewImages] = useState([]); // Array of File objects
  const [previewUrls, setPreviewUrls] = useState([]); // Array of blob URLs for preview

  useEffect(() => {
    if (initialData) {
      setColorName(initialData.color?.name || "");
      setColorHex(initialData.color?.hex || "#000000");
      setSizes(initialData.sizes || []);
      setExistingImages(initialData.images || []);
    } else {
      setSizes([{ size: 0, stock: 0 }]); // initial empty size
    }
  }, [initialData]);

  // Cleanup blob URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleAddSize = () => {
    setSizes([...sizes, { size: 0, stock: 0 }]);
  };

  const handleRemoveSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...sizes];
    updatedSizes[index][field] = Number(value);
    setSizes(updatedSizes);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate total images doesn't exceed 10
    if (existingImages.length + newImages.length + files.length > 10) {
      return toast.error("A variant can have a maximum of 10 images.");
    }

    setNewImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveExistingImage = (publicId) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.publicId !== publicId),
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!colorName.trim()) {
      return toast.error("Color name is required");
    }

    if (sizes.length === 0) {
      return toast.error("At least one size is required");
    }

    if (existingImages.length === 0 && newImages.length === 0) {
      return toast.error("At least one image is required");
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append stringified JSON
      formData.append(
        "color",
        JSON.stringify({ name: colorName, hex: colorHex }),
      );
      formData.append("sizes", JSON.stringify(sizes));

      // Append new files
      newImages.forEach((file) => {
        formData.append("images", file);
      });

      if (initialData) {
        // If editing, append existingImages publicIds to keep
        const existingPublicIds = existingImages.map((img) => img.publicId);
        formData.append("existingImages", JSON.stringify(existingPublicIds));

        await dispatch(
          updateVariant({
            productId: product._id,
            variantId: initialData._id,
            formData,
          }),
        ).unwrap();
        toast.success("Variant updated successfully!");
      } else {
        await dispatch(
          addVariant({
            productId: product._id,
            formData,
          }),
        ).unwrap();
        toast.success("Variant added successfully!");
      }

      setIsConfirmModalOpen(false);
      onClose();
    } catch (error) {
      toast.error(error || "Failed to save variant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111113] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3 text-white border-b border-white/10 pb-3">
        <button
          onClick={onClose}
          className="p-1.5 -ml-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-semibold">
          {initialData ? "Edit Variant" : "Add Variant"}
        </h2>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Color Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Color Name *
            </label>
            <input
              type="text"
              required
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="e.g. Varsity Red"
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 px-3.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
              Color Hex *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-xl border border-white/10 bg-[#0c0c0d] p-1"
              />
              <input
                type="text"
                required
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                placeholder="#000000"
                className="flex-1 rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 px-3.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-lime-400/50 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Sizes Section */}
        <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-white">Sizes & Stock</h3>
            <button
              type="button"
              onClick={handleAddSize}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/10 transition"
            >
              <Plus size={13} /> Add Size
            </button>
          </div>
          <div className="space-y-3">
            {sizes.map((sizeObj, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Size"
                    value={sizeObj.size}
                    onChange={(e) =>
                      handleSizeChange(idx, "size", e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2 px-3 text-xs text-white outline-none focus:border-lime-400/50"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={sizeObj.stock}
                    onChange={(e) =>
                      handleSizeChange(idx, "stock", e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2 px-3 text-xs text-white outline-none focus:border-lime-400/50"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSize(idx)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                  disabled={sizes.length === 1}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Images Section */}
        <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-white">Variant Images</h3>
            <span className="text-xs text-zinc-500">
              {existingImages.length + newImages.length} / 10 limit
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {/* Existing Images */}
            {existingImages.map((img) => (
              <div
                key={img.publicId}
                className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#0c0c0d]"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(img.publicId)}
                  className="absolute top-1 right-1 p-1 rounded-md bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* New Image Previews */}
            {previewUrls.map((url, idx) => (
              <div
                key={url}
                className="relative group aspect-square rounded-xl overflow-hidden border border-lime-400/50 bg-[#0c0c0d]"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveNewImage(idx)}
                  className="absolute top-1 right-1 p-1 rounded-md bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            {existingImages.length + newImages.length < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition text-zinc-400 hover:text-white"
              >
                <ImageIcon size={24} />
                <span className="text-xs font-medium">Add Image</span>
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
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
            {initialData ? "Update Variant" : "Save Variant"}
          </button>
        </div>
      </form>

      {/* Save / Update Confirmation Modal */}
      <ConfirmSaveVariantModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
        isEditing={Boolean(initialData)}
        colorName={colorName}
        colorHex={colorHex}
        sizesCount={sizes.length}
        imagesCount={existingImages.length + newImages.length}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default VariantForm;
