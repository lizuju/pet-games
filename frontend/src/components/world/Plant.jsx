const Plant = ({ onClick, onRestClick, resting, cooldownRemaining, boostRemaining, cooldownActive, pinged }) => {
  return (
    <div
      onClick={onClick}
      className={`absolute top-[65%] left-[25%] z-20 flex flex-col items-center cursor-pointer idle-float ${pinged ? 'scale-105' : ''}`}
      style={{ animationDelay: '1.6s' }}
    >
      {pinged && (
        <div className="absolute -top-4 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          Zen
        </div>
      )}
      <div className="relative w-16 h-24">
        <div className="absolute top-0 left-2 w-8 h-12 bg-emerald-400 rounded-full rounded-bl-none transform -rotate-45 shadow-sm"></div>
        <div className="absolute top-2 right-1 w-6 h-10 bg-emerald-500 rounded-full rounded-br-none transform rotate-45 shadow-sm"></div>
        <div className="absolute top-[-5px] left-4 w-6 h-10 bg-emerald-300 rounded-full rounded-b-none shadow-sm"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-orange-200 rounded-b-xl border-t-4 border-orange-300 shadow-md"></div>
      </div>
      <div
        onClick={(event) => {
          event.stopPropagation();
          if (!cooldownActive) {
            onRestClick?.();
          }
        }}
        className={`absolute bottom-0 -right-6 w-12 h-8 rounded-full shadow-sm flex items-center justify-center border ${resting ? 'bg-emerald-200 border-emerald-300' : cooldownActive ? 'bg-amber-200 border-amber-300' : 'bg-slate-300 border-slate-400'}`}
      >
        <div className="absolute -top-4 text-slate-400 text-[10px] font-bold">Zzz</div>
        {resting && boostRemaining > 0 && (
          <div className="absolute -bottom-4 text-emerald-500 text-[9px] font-bold">{boostRemaining}s</div>
        )}
        {!resting && cooldownActive && cooldownRemaining > 0 && (
          <div className="absolute -bottom-4 text-amber-500 text-[9px] font-bold">{cooldownRemaining}s</div>
        )}
        <div className="w-2 h-0.5 bg-slate-500 rounded-full mx-0.5"></div>
        <div className="w-2 h-0.5 bg-slate-500 rounded-full mx-0.5"></div>
      </div>
    </div>
  );
};

export default Plant;
