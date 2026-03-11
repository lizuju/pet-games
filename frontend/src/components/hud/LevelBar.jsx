import { Star } from '@phosphor-icons/react';

const LevelBar = ({ level, progress }) => {
  return (
    <div className="flex justify-between items-center px-1 pointer-events-auto">
      <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
          <Star size={10} weight="fill" className="text-amber-500" />
        </div>
        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: progress }}></div>
        </div>
        <span className="text-xs font-bold text-slate-600">Lvl {level}</span>
      </div>
    </div>
  );
};

export default LevelBar;
