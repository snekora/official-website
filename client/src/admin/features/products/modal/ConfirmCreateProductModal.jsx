import React, { useEffect } from "react";
import { Package, Loader2, X, PackageCheck } from "lucide-react";

const ConfirmCreateProductModal = ({
  isOpen,
  onClose,
  onConfirm,
  productData,
  categoryName,
  isSubmitting,
  isEditMode = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
            <Package size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {isEditMode ? "Confirm Product Update" : "Confirm Product Creation"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isEditMode
                ? "Verify the product details before updating"
                : "Verify the product details before creating"}
            </p>
          </div>
        </div>

        {/* Details Box */}
        <div className="rounded-xl border border-white/10 bg-[#0c0c0d] p-4 space-y-3">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Product Name
            </span>
            <span className="text-sm font-medium text-white break-all">
              {productData?.name}
            </span>
          </div>

          <div className="border-t border-white/5 pt-2 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
                Price
              </span>
              <span className="text-sm font-medium text-lime-400">
                ${productData?.price}
              </span>
            </div>
            {productData?.originalPrice && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
                  Original Price
                </span>
                <span className="text-sm font-medium text-zinc-400 line-through">
                  ${productData?.originalPrice}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-2 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
                Category
              </span>
              <span className="text-xs font-medium text-zinc-300">
                {categoryName || "Uncategorized"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
                Gender
              </span>
              <span className="text-xs font-medium text-zinc-300">
                {productData?.gender}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-400">
          {isEditMode
            ? "Are you sure you want to update this product with the specified details?"
            : "Are you sure you want to create this product with the specified details?"}
        </p>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <PackageCheck size={15} />
                {isEditMode ? "Confirm & Update" : "Confirm & Create"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCreateProductModal;
