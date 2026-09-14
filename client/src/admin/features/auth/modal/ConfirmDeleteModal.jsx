import React, { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, adminName, isDeleting }) => {
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
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Delete Administrator</h3>
            <p className="text-xs text-zinc-400">Confirm permanent account removal</p>
          </div>
        </div>

        {/* Modal Body */}
        <p className="text-xs text-zinc-300 leading-relaxed">
          Are you sure you want to delete admin account{" "}
          <span className="font-semibold text-white underline decoration-red-500/50">
            {adminName}
          </span>
          ? This action cannot be undone.
        </p>

        {/* Modal Footer / Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
