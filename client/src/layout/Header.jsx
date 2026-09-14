import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../features/cart/redux/cartSlice";
import SnekoraLogo from "../assets/logo/snekora_logo.png";
import NavigationMenu from "./Menu";
import HeaderSearch from "./HeaderSearch";
import AnnouncementBanner from "./AnnouncementBanner";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart || {});
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const totalCartItems =
    cart?.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;

  const handleOpenSearchFromMenu = () => {
    setMenuOpen(false);
    setSearchOpen(true);
  };

  return (
    <>
      {/* FIXED TOP CONTAINER (BANNER + MAIN HEADER) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBanner />

        {/* HEADER */}
        <header className="grid grid-cols-3 items-center bg-[#0e0e0e]/95 backdrop-blur-md px-6 py-4 border-b border-white/10">
          {/* Left: Menu Button */}
          <div className="flex items-center justify-start">
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu
                className="text-white hover:text-lime-400 transition"
                size={28}
              />
            </button>
          </div>

          {/* Center: Logo (Exact Center) */}
          <div className="flex items-center justify-center">
            <Link to="/">
              <img
                src={SnekoraLogo}
                alt="SNEKORA"
                className="h-7 object-contain"
              />
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-5">
            <HeaderSearch isOpen={searchOpen} setIsOpen={setSearchOpen} />

            <Link
              to="/cart"
              aria-label="Cart"
              className="relative text-white hover:text-lime-400 transition flex items-center justify-center"
            >
              <ShoppingCart size={26} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#bdec5e] text-black text-[10px] font-extrabold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-md">
                  {totalCartItems > 99 ? "99+" : totalCartItems}
                </span>
              )}
            </Link>
          </div>
        </header>
      </div>

      {/* Spacer matching fixed header total height */}
      <div className="h-[96px]" />

      {/* FULLSCREEN MENU */}
      <NavigationMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenSearch={handleOpenSearchFromMenu}
      />
    </>
  );
};

export default Header;
