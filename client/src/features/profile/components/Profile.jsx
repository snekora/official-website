import React, { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronLeft,
  Phone,
  MapPin,
  Mail,
  Package,
  Heart,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { fetchAddresses } from "../../address/redux/addressSlice";
import Breadcrumbs from "../../../components/Breadcrumbs";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addresses } = useSelector((state) => state.address);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const defaultAddress = useMemo(() => {
    return addresses.find((addr) => addr.isDefault);
  }, [addresses]);

  return (
    <div className=" bg-[#0a0a0a] text-white selection:bg-lime-300 selection:text-black pb-12 ">
      {/* Top Navigation / Breadcrumbs */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Profile" }]} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-lg mx-auto">
        {/* Centered Hero Section */}
        <div className="flex flex-col items-center pt-8 pb-10 text-center">
          <div className="w-28 h-28 rounded-full bg-[#181818] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner mb-4 relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "User"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1c1c1c] text-lime-300 text-4xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-2">
            {user?.name || "Your Name"}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
            <div className="flex items-center gap-1.5 bg-[#121212] px-3 py-1.5 rounded-full border border-white/5 shadow-sm">
              <Mail size={14} className="shrink-0" />
              <span>{user?.email || "Add your email"}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-1.5 bg-[#121212] px-3 py-1.5 rounded-full border border-white/5 shadow-sm">
                <Phone size={14} className="shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Grouped Menu Settings */}
        <div className="space-y-6">
          {/* Account Group */}
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-500 mb-3 ml-4">
              My Account
            </h3>
            <div className="bg-[#121212] border border-white/10 rounded-[24px] overflow-hidden divide-y divide-white/5">
              <Link
                to="/orders"
                className="flex items-center p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 text-lime-300 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    My Orders
                  </div>
                </div>
                <ChevronRight size={18} className="text-zinc-500" />
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 text-lime-300 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Heart size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Wishlist</div>
                </div>
                <ChevronRight size={18} className="text-zinc-500" />
              </Link>
            </div>
          </div>

          {/* Shipping Group */}
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-500 mb-3 ml-4">
              Shipping
            </h3>
            <div className="bg-[#121212] border border-white/10 rounded-[24px] overflow-hidden p-3">
              <div className="flex items-start p-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/5 text-lime-300 flex items-center justify-center mr-4 shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex-1 pt-1">
                  {defaultAddress ? (
                    <div className="text-zinc-300 text-sm leading-relaxed space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white">
                          {defaultAddress.type}
                        </span>
                        <span className="font-semibold text-white">
                          {defaultAddress.name}
                        </span>
                      </div>
                      <p>{defaultAddress.line1}</p>
                      {defaultAddress.line2 && <p>{defaultAddress.line2}</p>}
                      <p>
                        {defaultAddress.city}, {defaultAddress.state} -{" "}
                        {defaultAddress.pincode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm pt-1">
                      {user?.address || "No address added yet"}
                    </p>
                  )}
                </div>
              </div>

              <Link
                to="/address"
                className="flex items-center justify-center w-full h-12 bg-white/5 hover:bg-white/10 text-sm font-medium text-white rounded-xl transition-colors border border-white/10"
              >
                Manage Addresses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
