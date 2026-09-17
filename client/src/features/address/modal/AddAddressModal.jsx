import React, { useEffect, useState } from "react";
import { Home, Briefcase, CheckCircle2 } from "lucide-react";
import StateDropdown from "../components/StateDropdown";

const AddAddressModal = ({ isOpen, onClose, onSave, isFirstAddress }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    alternativePhone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    type: "Home",
    isDefault: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        phone: "",
        alternativePhone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        type: "Home",
        isDefault: isFirstAddress || false,
      });
    }
  }, [isOpen, isFirstAddress]);

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimatingOut(false);
    } else if (shouldRender) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimatingOut(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    const isVisible = isOpen || isAnimatingOut;
    document.body.style.overflow = isVisible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isAnimatingOut]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(formData);
    onClose?.();
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${
          isAnimatingOut ? "animate-backdrop-out" : "animate-backdrop-in"
        }`}
      />

      {/* Modal */}
      <div
        className={`relative w-full sm:max-w-md bg-[#0a0a0a] text-white border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[90vh] ${
          isAnimatingOut ? "animate-modal-out" : "animate-modal-in"
        }`}
      >
        {/* Form wrapping both Header and Body so the Header Save button submits it */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full overflow-hidden"
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl z-20">
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-[15px] font-medium transition-colors"
            >
              Cancel
            </button>
            <h2 className="text-[17px] font-semibold tracking-wide">
              New Address
            </h2>
            <button
              type="submit"
              className="text-lime-300 hover:text-lime-400 text-[15px] font-bold transition-colors active:scale-95"
            >
              Save
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto p-5 space-y-6 scrollbar-hide">
            {/* Contact Information Group */}
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-500 mb-3 ml-4">
                Contact
              </h3>
              <div className="bg-[#121212] border border-white/10 rounded-[24px] overflow-hidden divide-y divide-white/5">
                <div className="flex items-center px-4 py-1 h-14">
                  <span className="w-24 text-[15px] text-zinc-400">Name</span>
                  <input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Full Name"
                    required
                    className="flex-1 h-full bg-transparent text-[15px] text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
                <div className="flex items-center px-4 py-1 h-14">
                  <span className="w-24 text-[15px] text-zinc-400">Phone</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      handleChange("phone", e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="10-digit number"
                    className="flex-1 h-full bg-transparent text-[15px] text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
                <div className="flex items-center px-4 py-1 h-14">
                  <span className="w-24 text-[15px] text-zinc-400">
                    Alt Phone
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.alternativePhone}
                    onChange={(e) =>
                      handleChange(
                        "alternativePhone",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    placeholder="Optional"
                    className="flex-1 h-full bg-transparent text-[15px] text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>

            {/* Address Information Group */}
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-500 mb-3 ml-4">
                Location
              </h3>
              <div className="bg-[#121212] border border-white/10 rounded-[24px] divide-y divide-white/5 relative">
                <div className="flex items-center px-4 py-1 h-14 rounded-t-[24px]">
                  <input
                    value={formData.line1}
                    onChange={(e) => handleChange("line1", e.target.value)}
                    placeholder="Flat, House no., Building, Company"
                    required
                    className="w-full h-full bg-transparent text-[15px] text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
                <div className="flex items-center px-4 py-1 h-14">
                  <input
                    value={formData.line2}
                    onChange={(e) => handleChange("line2", e.target.value)}
                    placeholder="Area, Street, Sector, Village (Optional)"
                    className="w-full h-full bg-transparent text-[15px] text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
                <div className="flex items-center divide-x divide-white/5 relative">
                  <div className="flex-1 flex items-center px-4 py-1 h-14">
                    <input
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="City / Town"
                      required
                      className="w-full h-full bg-transparent text-[15px] text-white outline-none placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="flex-1 flex items-center px-4 py-1 h-14">
                    <StateDropdown
                      value={formData.state}
                      onChange={(val) => handleChange("state", val)}
                    />
                  </div>
                </div>
                <div className="flex items-center px-4 py-1 h-14 rounded-b-[24px]">
                  <span className="w-24 text-[15px] text-zinc-400">
                    Pincode
                  </span>
                  <input
                    value={formData.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    placeholder="6-digit PIN"
                    maxLength={6}
                    required
                    inputMode="numeric"
                    className="flex-1 h-full bg-transparent text-[15px] text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>

            {/* Address Type Group */}
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-500 mb-3 ml-4">
                Label
              </h3>
              <div className="flex p-1.5 bg-[#121212] border border-white/10 rounded-[20px]">
                <button
                  type="button"
                  onClick={() => handleChange("type", "Home")}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-[14px] text-[15px] font-medium transition-all ${
                    formData.type === "Home"
                      ? "bg-lime-300 text-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Home size={18} />
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("type", "Work")}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-[14px] text-[15px] font-medium transition-all ${
                    formData.type === "Work"
                      ? "bg-lime-300 text-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Briefcase size={18} />
                  Work
                </button>
              </div>
            </div>

            {/* Default Switch Group */}
            <div className="pb-6">
              <label
                className={`flex items-center justify-between p-4 bg-[#121212] border border-white/10 rounded-[20px] ${
                  isFirstAddress
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div>
                  <div className="text-[15px] font-medium text-white mb-0.5">
                    Set as Default
                  </div>
                  <div className="text-[13px] text-zinc-500">
                    {isFirstAddress
                      ? "Required for your first address"
                      : "Make this your primary address"}
                  </div>
                </div>

                {/* Custom Checkbox/Switch */}
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      !isFirstAddress &&
                      handleChange("isDefault", e.target.checked)
                    }
                    disabled={isFirstAddress}
                    className="sr-only" // Hide default checkbox
                  />
                  <div
                    className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${
                      formData.isDefault ? "bg-lime-300" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        formData.isDefault ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddressModal;
