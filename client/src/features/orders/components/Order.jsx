import React, { useState } from "react";
import {
  ChevronLeft,
  Package,
  Truck,
  CheckCircle2,
  ChevronRight,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import LottieComponent from "lottie-react";
import emptyBoxAnimation from "../../../assets/lottie/Boxempty.json";
import Breadcrumbs from "../../../components/Breadcrumbs";

const Lottie = LottieComponent.default || LottieComponent;

// Mock Order Data
const mockOrdersData = [
  {
    id: "ORD-982374Z",
    date: "May 15, 2026",
    status: "Delivered",
    total: 6498,
    itemCount: 2,
    items: [
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
      },
      {
        id: 2,
        image:
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
      },
    ],
  },
  {
    id: "ORD-871234X",
    date: "July 02, 2026",
    status: "In Transit",
    total: 2999,
    itemCount: 1,
    items: [
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
      },
    ],
  },
  {
    id: "ORD-459812Y",
    date: "July 06, 2026",
    status: "Processing",
    total: 8499,
    itemCount: 3,
    items: [
      {
        id: 2,
        image:
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
      },
      {
        id: 3,
        image:
          "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&q=80",
      },
      {
        id: 4,
        image:
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80",
      },
    ],
  },
];

const Order = () => {
  const [orders, setOrders] = useState(mockOrdersData);

  // Helper to render the correct status badge styling
  const getStatusConfig = (status) => {
    switch (status) {
      case "Delivered":
        return {
          color: "text-lime-300",
          bg: "bg-lime-300/10",
          border: "border-lime-300/20",
          icon: CheckCircle2,
        };
      case "In Transit":
        return {
          color: "text-blue-400",
          bg: "bg-blue-400/10",
          border: "border-blue-400/20",
          icon: Truck,
        };
      case "Processing":
        return {
          color: "text-amber-400",
          bg: "bg-amber-400/10",
          border: "border-amber-400/20",
          icon: Package,
        };
      default:
        return {
          color: "text-zinc-400",
          bg: "bg-zinc-400/10",
          border: "border-zinc-400/20",
          icon: Package,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-lime-300 selection:text-black pb-12">
      {/* Top Navigation / Breadcrumbs */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "My Orders" }]} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-xl mx-auto">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 pb-6 text-center">
            <div className="w-48 h-48 mb-6 flex items-center justify-center">
              <Lottie
                animationData={emptyBoxAnimation}
                loop={true}
                className="w-full h-full opacity-70"
              />
            </div>
            <h2 className="text-xl font-medium mb-2">No orders yet</h2>
            <p className="text-zinc-400 text-sm mb-8">
              When you place an order, it will show up here.
            </p>
            <Link to="/">
              <button className="bg-[#bdec5e] text-black font-semibold text-sm px-8 py-3.5 rounded-lg hover:bg-lime-400 transition-colors uppercase tracking-wider shadow-[0_0_20px_rgba(189,236,94,0.15)]">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => {
              const StatusIcon = getStatusConfig(order.status).icon;
              const statusStyle = getStatusConfig(order.status);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden hover:border-white/20 transition-colors"
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-white/5 flex justify-between items-start bg-white/2">
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">
                        Order {order.id}
                      </p>
                      <p className="text-sm font-medium">{order.date}</p>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.color}`}
                    >
                      <StatusIcon size={12} strokeWidth={2} />
                      <span className="text-[11px] font-semibold tracking-wide uppercase">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-[-8px]">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 rounded-lg bg-[#1f1f1f] border-2 border-[#0a0a0a] overflow-hidden relative z-1"
                          style={{ marginLeft: index > 0 ? "-12px" : "0" }}
                        >
                          <img
                            src={item.image}
                            alt="Item preview"
                            className="w-full h-full object-cover mix-blend-screen opacity-90"
                          />
                        </div>
                      ))}
                      {order.itemCount > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-white/10 border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-medium -ml-3 relative z-1">
                          +{order.itemCount - 3}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-zinc-400 mb-0.5">
                        {order.itemCount}{" "}
                        {order.itemCount === 1 ? "item" : "items"}
                      </p>
                      <p className="text-base font-semibold text-white">
                        ₹{order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Order Footer Actions */}
                  <div className="p-2 flex gap-2">
                    <button className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
                      View Details
                    </button>
                    {order.status !== "Delivered" && (
                      <button className="flex-1 py-2.5 rounded-xl bg-[#bdec5e]/10 text-[#bdec5e] hover:bg-[#bdec5e]/20 text-sm font-medium transition-colors">
                        Track Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
