import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteVariant } from "../redux/adminProductSlice";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Layers, Trash2, Edit2 } from "lucide-react";
import VariantForm from "./VariantForm";
import ConfirmDeleteProductModal from "../modal/ConfirmDeleteProductModal";

const VariantManager = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  
  const [variantToDelete, setVariantToDelete] = useState(null); // { id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (variantId, colorName) => {
    setVariantToDelete({ id: variantId, name: colorName });
  };

  const handleConfirmDelete = async () => {
    if (!variantToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(
        deleteVariant({ productId: product._id, variantId: variantToDelete.id })
      ).unwrap();
      toast.success("Variant deleted successfully");
      setVariantToDelete(null);
    } catch (error) {
      toast.error(error || "Failed to delete variant");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (variant) => {
    setEditingVariant(variant);
    setIsAdding(false);
  };

  if (isAdding || editingVariant) {
    return (
      <VariantForm
        product={product}
        initialData={editingVariant}
        onClose={() => {
          setIsAdding(false);
          setEditingVariant(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <Layers size={18} className="text-lime-400" />
          <h2 className="text-base font-semibold">
            Manage Variants: <span className="text-zinc-400 font-normal">{product.name}</span>
          </h2>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-lime-300"
        >
          <Plus size={16} />
          Add Variant
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111113] p-1">
        {!product.variants || product.variants.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-500 p-6 text-center">
            <Layers size={40} className="mb-3 text-zinc-600" />
            <p className="text-base font-medium text-zinc-400">No variants found</p>
            <p className="text-sm mt-1">Get started by adding a color variant for this product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-white">
              <thead className="bg-white/[0.03]">
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3.5 font-medium">Color</th>
                  <th className="px-5 py-3.5 font-medium">Images</th>
                  <th className="px-5 py-3.5 font-medium">Sizes / Stock</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <tr
                    key={variant._id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-5 w-5 rounded-full border border-white/20"
                          style={{ backgroundColor: variant.color?.hex || "#000" }}
                        ></div>
                        <p className="text-xs font-medium">{variant.color?.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        {variant.images?.slice(0, 4).map((img, i) => (
                          <img
                            key={i}
                            src={img.url}
                            alt=""
                            className="inline-block h-10 w-10 rounded-lg border-2 border-[#111113] object-cover bg-zinc-800"
                          />
                        ))}
                        {variant.images?.length > 4 && (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#111113] bg-zinc-800 text-xs font-medium text-zinc-300">
                            +{variant.images.length - 4}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {variant.sizes?.map((sizeObj, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded bg-white/5 px-2 py-1 text-xs font-medium text-zinc-300 border border-white/10"
                            title={`Stock: ${sizeObj.stock}`}
                          >
                            {sizeObj.size} <span className="text-zinc-500 ml-1">({sizeObj.stock})</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(variant)}
                          className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(variant._id, variant.color?.name)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                          title="Delete"
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

      {/* Variant Deletion Modal */}
      <ConfirmDeleteProductModal
        isOpen={Boolean(variantToDelete)}
        onClose={() => setVariantToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Color Variant"
        itemLabel={`${variantToDelete?.name} variant`}
        description="This action will delete all images and sizes associated with this color."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default VariantManager;
