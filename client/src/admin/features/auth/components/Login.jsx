import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Lock, User } from "lucide-react";
import loginBgImage from "../../../../assets/login/image.png";
import snekoraLogo from "../../../../assets/logo/snekora_logo.png";
import { toast } from "react-toastify";
import { adminLogin } from "../redux/adminAuthSlice";

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.adminAuth);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(
        adminLogin({
          username: formData.username,
          password: formData.password,
        }),
      ).unwrap();

      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (error) {
      toast.error(error || "Login failed. Check your credentials.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-dvh flex flex-col lg:flex-row bg-[#0b0b0c] text-[#F5F5F0] font-sans overflow-hidden">
      {/* Left */}
      <div className="relative w-full lg:w-1/2 flex-1 lg:flex-none lg:h-dvh bg-black overflow-hidden">
        <img
          src={loginBgImage}
          alt="Sneaker lifestyle shot"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#0b0b0c] via-transparent lg:bg-linear-to-r lg:from-transparent lg:to-[#0b0b0c]" />

        <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-10 flex items-center gap-2">
          <img
            src={snekoraLogo}
            alt="Snekora Logo"
            className="h-6 md:h-8 object-contain"
          />
          <span className="rounded-md bg-lime-400/20 px-2 py-1 text-[10px] font-bold text-lime-400 tracking-wider">
            ADMIN
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="relative w-full lg:w-1/2 shrink-0 flex items-center justify-center p-6 pb-10 lg:p-16 z-10">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 uppercase">
            SYSTEM ACCESS
          </h1>

          <p className="text-zinc-400 text-sm mb-8">
            Sign in to access the Snekora administrator dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
       
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-[#151515] border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#151515] border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-400 text-black font-semibold text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-lime-500 transition-colors group mt-6 disabled:opacity-60"
            >
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight
                size={18}
                className="text-black/50 group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-6">
            Authorized personnel only. Use of this system is monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;