import React from "react";
import { ArrowRight } from "lucide-react";
import SnekoraLogo from "../assets/logo/snekora_logo.png";

const Footer = () => {
  const shopLinks = ["New Arrivals", "Sneakers", "Men", "Women", "Sale"];
  const helpLinks = ["FAQ", "Shipping", "Returns", "Contact Us"];
  const followLinks = ["Instagram", "Facebook", "X", "TikTok"];

  return (
    <footer className="bg-[#0e0e0e] border-t border-white/10 pt-16 pb-8 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* NEWSLETTER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/10 pb-16 mb-16">
          <div className="max-w-md">
            <h3 className="text-3xl font-bold text-white mb-4">
              Stay in the loop.
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Join our newsletter for exclusive drops, early access to sales,
              and the latest sneaker news.
            </p>
          </div>

          <div className="w-full md:w-auto flex items-center border-b border-zinc-600 focus-within:border-lime-400 transition-colors duration-300 pb-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent border-none outline-none text-white placeholder:text-zinc-600 w-full md:w-64 font-medium"
            />
            <button className="text-white hover:text-lime-400 transition-colors ml-4 group">
              <ArrowRight
                size={24}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>

        {/* LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-start">
            <img src={SnekoraLogo} alt="SNEKORA" className="h-7 mb-6" />
            <p className="text-zinc-400 text-sm leading-relaxed pr-4">
              Premium sneakers, curated collections, and exclusive drops.
              Elevate your footwear game with SNEKORA.
            </p>
          </div>

          {/* Shop Column */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-zinc-500 uppercase tracking-widest text-sm mb-2">
              Shop
            </h4>
            {shopLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-zinc-300 hover:text-lime-400 transition-colors text-sm font-medium w-fit"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Help Column */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-zinc-500 uppercase tracking-widest text-sm mb-2">
              Help
            </h4>
            {helpLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-zinc-300 hover:text-lime-400 transition-colors text-sm font-medium w-fit"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Follow Column */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-zinc-500 uppercase tracking-widest text-sm mb-2">
              Follow
            </h4>
            {followLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-zinc-300 hover:text-lime-400 transition-colors text-sm font-medium w-fit"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & LEGAL */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10 text-zinc-500 text-xs tracking-widest">
          <p>© 2026 SNEKORA. ALL RIGHTS RESERVED.</p>

          <div className="flex gap-8">
            <a
              href="#privacy"
              className="hover:text-lime-400 transition-colors"
            >
              PRIVACY POLICY
            </a>
            <a href="#terms" className="hover:text-lime-400 transition-colors">
              TERMS OF SERVICE
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
