export const BGSquareBox = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-[-10%] right-[-5%] w-175 h-175 rounded-full bg-brand-500/8"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-125 h-125 rounded-full bg-brand-400/5"></div>
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      ></div>
    </div>
  );
};
