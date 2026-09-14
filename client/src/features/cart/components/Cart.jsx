import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Minus, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import LottieComponent from 'lottie-react';
import boxEmptyAnimation from '../../../assets/lottie/Boxempty.json';
import { fetchCart, updateCartItem, removeCartItem } from '../redux/cartSlice';
import { fetchAddresses } from '../../address/redux/addressSlice';
import { openCartWhatsApp } from '../../../services/whatsappOrder';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import Breadcrumbs from '../../../components/Breadcrumbs';

const Lottie = LottieComponent.default || LottieComponent;


// Removed mock data

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { cart, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { addresses } = useSelector((state) => state.address);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    } else {
      navigate('/login');
    }
  }, [dispatch, isAuthenticated, navigate]);

  const cartItems = cart?.items || [];

  const handleUpdateQuantity = async (itemId, currentQuantity, delta) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    if (newQuantity !== currentQuantity) {
      try {
        await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      } catch (error) {
        toast.error(error || "Failed to update quantity");
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeCartItem(itemId)).unwrap();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error || "Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setCheckoutLoading(true);
    try {
      let currentAddresses = addresses;
      if (!currentAddresses || currentAddresses.length === 0) {
        currentAddresses = await dispatch(fetchAddresses()).unwrap();
      }

      const defaultAddress = currentAddresses?.find((a) => a.isDefault);

      if (!defaultAddress) {
        toast.info("Please select or add a default address first.");
        navigate("/address");
        return;
      }

      if (!defaultAddress.phone) {
        toast.error("Your default address is missing a phone number. Please update it.");
        navigate("/address");
        return;
      }

      openCartWhatsApp({
        cartItems,
        address: defaultAddress,
        subtotal,
        shipping,
        total,
      });
    } catch (error) {
      toast.error("Failed to fetch your address. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + ((item.product?.price || 0) * item.quantity);
  }, 0);
  const shipping = 0; 
  const total = subtotal + shipping;

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#bdec5e]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-lime-300 selection:text-black pb-12">
      {/* Top Navigation / Breadcrumbs */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Cart" }]} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-xl mx-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 pb-6 text-center">
            <div className="w-48 h-48 mb-6 flex items-center justify-center">
              <Lottie 
                animationData={boxEmptyAnimation} 
                loop={true} 
                className="w-full h-full"
              />
            </div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-zinc-400 text-sm mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/">
              <button className="bg-[#bdec5e] text-black font-semibold text-sm px-8 py-3.5 rounded-lg hover:bg-lime-400 transition-colors uppercase tracking-wider">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="flex flex-col gap-6 mb-8">
              {cartItems.map((item) => {
                const product = item.product || {};
                const variant = product.variants?.find((v) => v._id === item.variant) || {};
                const colorName = variant.color?.name || "N/A";
                // find image from variant or product
                const image = variant.images?.[0]?.url || product.images?.[0]?.url || null;

                const productLink = `/product/${product.slug || product._id}`;

                return (
                  <div key={item._id} className="flex gap-4 p-4 rounded-2xl border border-white/10 bg-white/2">
                    {/* Item Image */}
                    <Link to={productLink} state={{ from: "cart" }} className="w-24 h-24 rounded-xl overflow-hidden bg-[#1f1f1f] shrink-0 relative group cursor-pointer">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#27272a_0%,#1f1f1f_100%)] -z-10" />
                      <img 
                        src={image} 
                        alt={product.name} 
                        className="w-full h-full object-cover mix-blend-screen opacity-90 group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="flex flex-col grow justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link to={productLink} state={{ from: "cart" }} className="hover:text-[#bdec5e] transition-colors cursor-pointer">
                            <h3 className="text-[15px] font-semibold tracking-wide mb-1">{product.name}</h3>
                          </Link>
                          <p className="text-zinc-400 text-xs mb-2">
                            Size: {item.size} • Color: {colorName}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleRemoveItem(item._id)}
                          className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[15px] font-medium">₹{(product.price || 0).toLocaleString()}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1 border border-white/5">
                          <button 
                            onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors text-zinc-400 hover:text-white disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} strokeWidth={2} />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors text-zinc-400 hover:text-white"
                          >
                            <Plus size={14} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Add from Wishlist Button */}
              <button className="w-full py-4 mt-2 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                <Heart size={18} strokeWidth={1.5} />
                Add more from Wishlist
              </button>
            </div>

            {/* Order Summary */}
            <div className="border-t border-white/10 pt-6 mb-8">
              <h3 className="text-[15px] font-semibold mb-4 tracking-wide">Order Summary</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-400 font-medium">FREE</span>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex justify-between items-center text-base font-semibold mt-1">
                  <span>Total</span>
                  <span className="text-lime-300">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Checkout Action */}
            <button 
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full bg-[#bdec5e] text-black font-semibold text-sm py-4 rounded-xl hover:bg-lime-400 transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(189,236,94,0.15)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? "PROCESSING..." : "PROCEED TO CHECKOUT via WhatsApp"}
              <ArrowRight size={18} strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;