import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/redux/authSlice";
import {
  X,
  Heart,
  Package,
  ShoppingCart,
  MapPin,
  LogOut,
  User,
  Search,
} from "lucide-react";
import SnekoraLogo from "../assets/logo/snekora_logo.png";

const NavigationMenu = ({ isOpen, onClose, onOpenSearch }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist || {});

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  const shopLinks = [
    { label: "Home", path: "/" },
    { label: "Men", path: "/products?gender=Men" },
    { label: "Women", path: "/products?gender=Women" },
    { label: "New Arrivals", path: "/products?sort=newest" },
  ];
  const helpLinks = ["Contact", "Shipping", "Returns"];
  const followLinks = ["Instagram", "Facebook", "X"];

  return (
    <div
      className={`fixed inset-0 z-100 bg-[#0e0e0e] flex flex-col
      transition-transform duration-700 ease-[cubic-bezier(.77,0,.175,1)]
      ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* TOP BAR */}
      <div className="grid grid-cols-3 items-center px-6 py-5 border-b border-white/10">
        {/* Left Logo */}
        <div className="flex items-center justify-start">
          <img src={SnekoraLogo} alt="SNEKORA" className="h-7 object-contain" />
        </div>

        {/* Center Spacer */}
        <div className="flex items-center justify-center" />

        {/* Right Close Button & Search */}
        <div className="flex items-center justify-end gap-5">
          <button onClick={onOpenSearch} aria-label="Open Search">
            <Search
              size={24}
              className="text-white hover:text-lime-400 transition"
            />
          </button>
          <button onClick={onClose} aria-label="Close menu">
            <X
              size={28}
              className="text-white hover:text-lime-400 transition"
            />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-8 py-10 md:px-16">
        <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
          {/* TOP ROW: SHOP & ACCOUNT */}
          <div className="grid grid-cols-2 gap-4 md:gap-16 mb-8">
            {/* SHOP */}
            <div className="flex flex-col space-y-4">
              <h4 className="text-zinc-500 uppercase tracking-widest text-xs md:text-sm mb-2">
                Shop
              </h4>
              {shopLinks.map((item, i) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={`text-left text-xl md:text-3xl font-bold text-white hover:text-lime-400 transition-all duration-500 block ${
                    isOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* ACCOUNT */}
            <div className="flex flex-col space-y-5">
              <h4 className="text-zinc-500 uppercase tracking-widest text-xs md:text-sm mb-2">
                Account
              </h4>

              <Link
                to="/wishlist"
                onClick={onClose}
                className="group flex items-center gap-3 text-white hover:text-lime-400 transition"
              >
                <Heart
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl font-medium">Wishlist</span>
                  {wishlistItems?.length > 0 && (
                    <span className="bg-[#bdec5e] text-black text-[10px] font-extrabold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-md">
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
              </Link>

              <Link
                to="/orders"
                onClick={onClose}
                className="group flex items-center gap-3 text-white hover:text-lime-400 transition"
              >
                <Package
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-lg md:text-xl font-medium">Orders</span>
              </Link>

              <Link
                to="/cart"
                onClick={onClose}
                className="group flex items-center gap-3 text-white hover:text-lime-400 transition"
              >
                <ShoppingCart
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-lg md:text-xl font-medium">Cart</span>
              </Link>

              <Link
                to="/address"
                onClick={onClose}
                className="group flex items-center gap-3 text-white hover:text-lime-400 transition"
              >
                <MapPin
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-lg md:text-xl font-medium">Address</span>
              </Link>
            </div>
          </div>

          {/* USER SECTION */}
          <div className="flex items-center justify-between border border-white/10 rounded-xl bg-white/5 px-4 py-3 mb-5">
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-linear-to-tr from-lime-400 to-emerald-500 flex items-center justify-center text-black font-bold text-sm shadow-[0_0_10px_rgba(163,230,53,0.2)]">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}

                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">
                      {user?.name}
                    </p>
                    <Link
                      to="/profile"
                      onClick={onClose}
                      className="text-[11px] text-zinc-400 hover:text-lime-400 transition mt-0.5 inline-block"
                    >
                      View Profile
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-zinc-400">
                    <User size={18} />
                  </div>

                  <div>
                    <p className="text-zinc-400 text-sm font-medium leading-tight">
                      Guest User
                    </p>
                    <span className="text-[11px] text-zinc-500">
                      Sign in to sync your bag
                    </span>
                  </div>
                </>
              )}
            </div>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-zinc-300 hover:text-red-400 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-semibold hover:bg-lime-400 hover:text-black transition-all duration-300 shadow-[0_4px_12px_rgba(255,255,255,0.05)] cursor-pointer"
              >
                <User size={14} />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* SEPARATOR */}
          <hr className="border-white/10 my-6" />

          {/* BOTTOM ROW: HELP & FOLLOW */}
          <div className="grid grid-cols-2 gap-4 md:gap-16 mt-6">
            {/* HELP */}
            <div className="flex flex-col space-y-3">
              <h4 className="text-zinc-500 uppercase tracking-widest text-xs md:text-sm mb-2">
                Help
              </h4>
              {helpLinks.map((item) => (
                <button
                  key={item}
                  onClick={onClose}
                  className="text-left text-zinc-300 text-base hover:text-lime-400 transition"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* FOLLOW */}
            <div className="flex flex-col space-y-3">
              <h4 className="text-zinc-500 uppercase tracking-widest text-xs md:text-sm mb-2">
                Follow
              </h4>
              {followLinks.map((item) => (
                <button
                  key={item}
                  onClick={onClose}
                  className="text-left text-zinc-300 text-base hover:text-lime-400 transition"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-6 flex justify-center border-t border-white/10">
        <div className="text-zinc-500 text-sm tracking-widest">
          © 2026 SNEKORA
        </div>
      </div>
    </div>
  );
};

export default NavigationMenu;
