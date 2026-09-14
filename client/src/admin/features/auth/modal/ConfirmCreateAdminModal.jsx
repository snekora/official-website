import React, { useState, useEffect } from "react";
import { UserPlus, Loader2, X, Eye, EyeOff, ShieldCheck } from "lucide-react";

const ConfirmCreateAdminModal = ({
  isOpen,
  onClose,
  onConfirm,
  adminData,
  isSubmitting,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setShowPassword(false);
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
            <UserPlus size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Confirm Admin Creation
            </h3>
            <p className="text-xs text-zinc-400">
              Verify the details before creating the account
            </p>
          </div>
        </div>

        {/* Modal Content - Details */}
        <div className="rounded-xl border border-white/10 bg-[#0c0c0d] p-4 space-y-3">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Username
            </span>
            <span className="text-sm font-medium text-white break-all">
              {adminData?.username}
            </span>
          </div>

          <div className="border-t border-white/5 pt-2 flex flex-col space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Password
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-mono text-zinc-200 break-all">
                {showPassword ? adminData?.password : "••••••••••••"}
              </span>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-400">
          Are you sure you want to create this administrator account with the specified credentials?
        </p>

        {/* Modal Footer / Actions */}
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
                Creating...
              </>
            ) : (
              <>
                <ShieldCheck size={15} />
                Confirm & Create
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCreateAdminModal;
