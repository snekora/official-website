import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../features/auth/redux/adminAuthSlice";
import { X, Package, LogOut, User, Image, ShieldCheck, LayoutDashboard, PlaySquare } from "lucide-react";
import SnekoraLogo from "../../assets/logo/snekora_logo.png";

const NavigationMenu = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin, isAuthenticated } = useSelector((state) => state.adminAuth);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(adminLogout());
    onClose();
    navigate("/admin/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Posters", path: "/admin/poster", icon: Image },
    { name: "Stories", path: "/admin/stories", icon: PlaySquare },
    { name: "Manage Admins", path: "/admin/manage", icon: ShieldCheck },
  ];

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#0e0e0e] flex flex-col
      transition-transform duration-700 ease-[cubic-bezier(.77,0,.175,1)]
      ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src={SnekoraLogo} alt="SNEKORA" className="h-7" />
          <span className="rounded-md bg-lime-400/20 px-2 py-1 text-[10px] font-bold text-lime-400 tracking-wider">
            ADMIN
          </span>
        </div>

        <button onClick={onClose}>
          <X size={32} className="text-white hover:text-lime-400 transition" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-8 py-10 md:px-16">
        <div className="max-w-xl mx-auto h-full flex flex-col justify-center">
          {/* MENU SECTION */}
          <div className="flex flex-col space-y-6 mb-12">
            <h4 className="text-zinc-500 uppercase tracking-widest text-xs md:text-sm mb-2">
              Menu
            </h4>
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  to={item.path}
                  key={item.name}
                  onClick={onClose}
                  className={`group flex items-center gap-4 text-2xl md:text-4xl font-bold text-white hover:text-lime-400 transition-all duration-500 ${
                    isOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <Icon
                    size={28}
                    className="group-hover:scale-110 transition-transform opacity-70 group-hover:opacity-100"
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* USER SECTION */}
          <div className="flex items-center justify-between border border-white/10 rounded-xl bg-white/5 px-4 py-3 mb-5">
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="w-9 h-9 rounded-full bg-linear-to-tr from-lime-400 to-emerald-500 flex items-center justify-center text-black font-bold text-sm shadow-[0_0_10px_rgba(163,230,53,0.2)]">
                    {admin?.username?.charAt(0).toUpperCase() || "A"}
                  </div>

                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">
                      {admin?.username || "Admin"}
                    </p>
                    <span className="text-[11px] text-zinc-400 mt-0.5 inline-block">
                      Administrator
                    </span>
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
                to="/admin/login"
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
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-6 flex justify-center border-t border-white/10">
        <div className="text-zinc-500 text-sm tracking-widest">
          © 2026 SNEKORA ADMIN
        </div>
      </div>
    </div>
  );
};

export default NavigationMenu;
