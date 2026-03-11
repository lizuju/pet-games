import { Envelope, Gear, Package } from '@phosphor-icons/react';

const SideButtons = ({ onOpenPanel }) => {
  return (
    <div className="absolute right-4 top-40 z-40 flex flex-col gap-3 pointer-events-auto">
      <button
        onClick={() => onOpenPanel('inventory')}
        className="w-12 h-12 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] flex items-center justify-center text-blue-500 hover:scale-105 active:scale-95 transition-all border border-blue-50 group"
      >
        <Package size={20} weight="fill" className="text-blue-500 group-hover:-translate-y-0.5 transition-transform" />
      </button>
      <button
        onClick={() => onOpenPanel('messages')}
        className="w-12 h-12 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] flex items-center justify-center text-purple-500 hover:scale-105 active:scale-95 transition-all border border-purple-50 relative group"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-sm">2</div>
        <Envelope size={20} weight="fill" className="text-purple-500 group-hover:-translate-y-0.5 transition-transform" />
      </button>
      <button
        onClick={() => onOpenPanel('settings')}
        className="w-12 h-12 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] flex items-center justify-center text-slate-400 hover:text-slate-600 hover:scale-105 active:scale-95 transition-all border border-slate-50 group"
      >
        <Gear size={20} weight="fill" className="text-slate-400 group-hover:rotate-45 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default SideButtons;
