import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  MapPin,
  Plus,
  Home,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import AddAddressModal from "../modal/AddAddressModal";
import EditAddressModal from "../modal/EditAddressModal";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../redux/addressSlice";
import Breadcrumbs from "../../../components/Breadcrumbs";

const Address = () => {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.address);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleAddSave = async (newAddress) => {
    await dispatch(addAddress(newAddress));
    setIsAddOpen(false);
  };

  const handleEditSave = async (updatedData) => {
    await dispatch(
      updateAddress({ id: selectedAddress._id, data: updatedData }),
    );
    setIsEditOpen(false);
    setSelectedAddress(null);
  };

  const handleRemoveAddress = (id) => {
    dispatch(deleteAddress(id));
  };

  const handleSetDefault = (id) => {
    dispatch(setDefaultAddress(id));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-lime-300 selection:text-black pb-12">
      {/* Top Navigation / Breadcrumbs */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Address" }]} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-xl mx-auto">
        {/* Add Address Button */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full mb-5 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-[#bdec5e] text-black font-semibold hover:bg-lime-400 transition-colors"
        >
          <Plus size={18} strokeWidth={2.2} />
          Add Address
        </button>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4 text-zinc-400">
            Loading addresses...
          </div>
        )}

        {/* Empty State */}
        {!loading && addresses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-[28px] border-2 border-dashed border-white/10 bg-[#121212]/50 mt-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MapPin size={28} className="text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Addresses Yet
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-[250px]">
              You haven't added any delivery addresses. Add your first address
              to get started.
            </p>
          </div>
        )}

        {/* Address List */}
        {!loading && addresses.length > 0 && (
          <div className="flex flex-col gap-4">
            {addresses.map((address) => {
              const AddressIcon = address.type === "Work" ? Briefcase : Home;
              return (
                <div
                  key={address._id}
                  className={`rounded-[24px] border p-4 transition-colors ${
                    address.isDefault
                      ? "border-lime-400/40 bg-white/5"
                      : "border-white/10 bg-[#121212]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <AddressIcon size={18} className="text-zinc-300" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold text-[15px]">
                            {address.type}
                          </h3>
                        </div>
                        <p className="text-zinc-500 text-xs mt-1 uppercase tracking-wider">
                          Delivery Address
                        </p>
                      </div>
                    </div>

                    {/* MOVED: Default Tag now sits at the top right of the card */}
                    {address.isDefault && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full bg-lime-300 text-black font-semibold uppercase tracking-wide">
                        <CheckCircle2 size={12} />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm leading-relaxed text-zinc-300">
                    <p className="font-medium text-white">{address.name}</p>
                    <p>Phone: {address.phone}</p>
                    {address.alternativePhone && (
                      <p>Alt Phone: {address.alternativePhone}</p>
                    )}
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-5">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address._id)}
                        className="flex-1 h-11 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedAddress(address);
                        setIsEditOpen(true);
                      }}
                      className="flex-1 h-11 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveAddress(address._id)}
                      className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-zinc-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddAddressModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddSave}
        isFirstAddress={addresses.length === 0}
      />

      {isEditOpen && (
        <EditAddressModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedAddress(null);
          }}
          onSave={handleEditSave}
          address={selectedAddress}
        />
      )}
    </div>
  );
};

export default Address;
