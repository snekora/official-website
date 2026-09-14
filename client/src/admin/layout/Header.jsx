import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, UserCircle2, Bell } from "lucide-react";
import SnekoraLogo from "../../assets/logo/snekora_logo.png";
import NavigationMenu from "./Menu";

const AdminHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-[#0e0e0e] px-6 py-5 border-b border-white/10">
        <button onClick={() => setMenuOpen(true)}>
          <Menu
            className="text-white hover:text-lime-400 transition"
            size={28}
          />
        </button>

        <Link to="/admin">
          <div className="flex items-center gap-2">
            <img src={SnekoraLogo} alt="SNEKORA" className="h-7" />
            <span className="rounded-md bg-lime-400/20 px-2 py-1 text-[10px] font-bold text-lime-400 tracking-wider">
              ADMIN
            </span>
          </div>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="relative text-white hover:text-lime-400 transition">
            <Bell size={24} />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-lime-400" />
          </button>

          <button className="flex items-center gap-2 text-white hover:text-lime-400 transition hidden sm:flex">
            <UserCircle2 size={26} />
          </button>
        </div>
      </header>

      <div className="h-[72px]" />

      {/* FULLSCREEN MENU */}
      <NavigationMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default AdminHeader;
