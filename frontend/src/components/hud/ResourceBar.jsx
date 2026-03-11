import { CurrencyDollar, Fish, Users } from '@phosphor-icons/react';

const ResourceBar = ({ money, moneyRate, fish, staffCount, maxStaff, onMoneyClick, onFishClick }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-1.5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white pointer-events-auto">
      <div
        onClick={onMoneyClick}
        className="flex items-center gap-2 pl-1 pr-3 py-1 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50">
          <CurrencyDollar size={14} weight="fill" className="text-emerald-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-slate-800 font-extrabold text-sm leading-tight">{money}</span>
          <span className="text-emerald-500 text-[10px] font-bold leading-tight">{moneyRate}</span>
        </div>
      </div>

      <div
        onClick={onFishClick}
        className="flex items-center gap-2 pl-1 pr-3 py-1 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shadow-sm border border-rose-200/50">
          <Fish size={12} weight="fill" className="text-rose-500" />
        </div>
        <span className="text-slate-800 font-extrabold text-sm">{fish}</span>
        <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold ml-1 shadow-sm">+</div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100">
        <Users size={12} weight="fill" className="text-indigo-400" />
        <span className="text-indigo-900 font-bold text-sm">{staffCount}/{maxStaff}</span>
      </div>
    </div>
  );
};

export default ResourceBar;
