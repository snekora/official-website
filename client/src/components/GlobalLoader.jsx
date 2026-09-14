const GlobalLoader = () => {
  return (
    <div
      id="global-loader"
      className="fixed inset-0 z-9999 hidden items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default GlobalLoader;