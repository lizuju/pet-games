import { Crown, Star } from '@phosphor-icons/react';
import { customStyles } from '../../styles/customStyles';

const CharacterCeoCat = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="absolute top-[10%] left-1/2 -translate-x-1/2 w-40 flex flex-col items-center z-10 cursor-pointer"
    >
      <div className="absolute -top-10 flex flex-col items-center">
        <div className="bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-600 text-xs font-black shadow-sm border border-emerald-200 mb-1" style={customStyles.particleFloat}>+$50</div>
        <div className="bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-600 text-xs font-black shadow-sm border border-emerald-200" style={customStyles.particleFloat2}>+$50</div>
      </div>

      <div className="relative w-24 h-24 mb-[-15px] z-20 hover:scale-105 transition-transform cursor-pointer" style={customStyles.bounceSoft}>
        <div className="absolute top-2 left-2 w-7 h-7 bg-white border-t-2 border-l-2 border-slate-200" style={customStyles.catEarLeft}></div>
        <div className="absolute top-2 right-2 w-7 h-7 bg-white border-t-2 border-r-2 border-slate-200" style={customStyles.catEarRight}></div>

        <div className="absolute top-6 w-24 h-16 bg-white rounded-3xl border-2 border-slate-200 shadow-inner flex flex-col items-center overflow-hidden">
          <div className="absolute -top-1 text-amber-400 text-sm drop-shadow-sm">
            <Crown size={12} weight="fill" className="text-amber-400" />
          </div>
          <div className="flex gap-5 mt-5">
            <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
          </div>
          <div className="w-2 h-1.5 bg-rose-300 rounded-full mt-1"></div>
          <div className="absolute top-6 left-3 w-3 h-1.5 bg-rose-200 rounded-full opacity-60"></div>
          <div className="absolute top-6 right-3 w-3 h-1.5 bg-rose-200 rounded-full opacity-60"></div>
          <div className="absolute bottom-0 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500"></div>
        </div>
      </div>

      <div className="relative w-36 h-20 bg-slate-100 rounded-2xl shadow-xl z-10 flex flex-col items-center justify-end border border-white">
        <div className="absolute top-0 w-full h-8 bg-slate-50 rounded-t-2xl border-b border-slate-200"></div>
        <div className="absolute top-[-10px] w-20 h-14 bg-slate-800 rounded-lg p-1 shadow-lg flex flex-col border border-slate-700">
          <div className="w-full flex-1 bg-indigo-500 rounded flex items-center justify-center overflow-hidden relative">
            <div className="absolute bottom-0 w-full h-1/2 bg-indigo-400/50 flex items-end px-1 gap-0.5">
              <div className="w-full h-[40%] bg-emerald-400 rounded-t-sm"></div>
              <div className="w-full h-[70%] bg-emerald-400 rounded-t-sm"></div>
              <div className="w-full h-[90%] bg-emerald-400 rounded-t-sm"></div>
            </div>
          </div>
          <div className="h-2 w-full flex justify-center mt-1">
            <div className="w-1 h-2 bg-slate-600"></div>
          </div>
        </div>
        <div className="w-full h-6 flex justify-between px-4 pb-2">
          <div className="w-2 h-full bg-slate-300 rounded-full"></div>
          <div className="w-2 h-full bg-slate-300 rounded-full"></div>
        </div>
        <div className="absolute -right-4 -bottom-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-md border border-amber-300 flex items-center gap-1">
          LV.12 <Star size={10} weight="fill" className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default CharacterCeoCat;
