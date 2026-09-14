import { Truck, Crown, Lock } from "lucide-react";

const SectionTwo = () => {
  return (
    <div className="bg-[#111111] text-white flex justify-between py-10 text-center px-10 ">
      <div className="flex flex-col items-center justify-center">
        <Truck size={24} className="mb-2 text-lime-400" />
        <p className="flex flex-col text-xs md:text-sm font-semibold uppercase tracking-wider leading-tight text-zinc-300">
          <span>Pan India</span>
          <span>Delivery</span>
        </p>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Crown size={24} className="mb-2 text-lime-400" />
        <p className="flex flex-col text-xs md:text-sm font-semibold uppercase tracking-wider leading-tight text-zinc-300">
          <span>Premium</span>
          <span>Quality</span>
        </p>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Lock size={24} className="mb-2 text-lime-400" />
        <p className="flex flex-col text-xs md:text-sm font-semibold uppercase tracking-wider leading-tight text-zinc-300">
          <span>Secure</span>
          <span>Payments</span>
        </p>
      </div>
    </div>
  );
};

export default SectionTwo;
