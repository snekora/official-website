import React from "react";
import { Link } from "react-router-dom";
import SnekoraLogo from "../../assets/logo/snekora_logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0e0e0e] px-6 py-2.5 mt-auto">
      <div className="mx-auto flex flex-col items-center justify-between gap-2 text-[11px] text-zinc-400 sm:flex-row">
        <p className="text-center sm:text-left text-zinc-500">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-zinc-300">SNEKORA</span>. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
