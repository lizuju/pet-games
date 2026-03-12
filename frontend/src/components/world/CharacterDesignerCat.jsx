import { Heart, PaintBrush } from '@phosphor-icons/react';
import { customStyles } from '../../styles/customStyles';

const CharacterDesignerCat = ({ onClick, pinged }) => {
  return (
    <div
      onClick={onClick}
      className={`absolute top-[45%] right-[5%] w-32 flex flex-col items-center z-30 cursor-pointer idle-float ${pinged ? 'scale-105' : ''}`}
      style={{ animationDelay: '1.1s' }}
    >
      {pinged && (
        <div className="absolute -top-3 left-6 bg-rose-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          +XP
        </div>
      )}
      <div className="absolute -top-10 flex flex-col items-center">
        <div className="text-rose-400 text-lg drop-shadow-sm mb-1" style={customStyles.particleFloat}>
          <Heart size={18} weight="fill" className="text-rose-400" />
        </div>
      </div>

      <div className="relative w-20 h-20 mb-[-10px] z-20 hover:scale-105 transition-transform cursor-pointer" style={customStyles.bounceSoftDelayed}>
        <div className="absolute top-1 left-2 w-6 h-6 bg-orange-300" style={customStyles.catEarLeft}></div>
        <div className="absolute top-1 right-2 w-6 h-6 bg-orange-300" style={customStyles.catEarRight}></div>

        <div className="absolute top-4 w-20 h-16 bg-orange-200 rounded-2xl shadow-inner flex flex-col items-center overflow-hidden border-b-4 border-orange-300">
          <div className="absolute top-8 left-0 w-6 h-1 bg-slate-700 rounded-r-full z-30 transform -rotate-12"></div>
          <div className="flex gap-4 mt-5 z-10">
            <div className="w-2.5 h-2.5 bg-slate-800 rounded-full flex justify-end overflow-hidden">
              <div className="w-1 h-1 bg-white rounded-full mt-0.5 mr-0.5"></div>
            </div>
            <div className="w-2.5 h-2.5 bg-slate-800 rounded-full flex justify-end overflow-hidden">
              <div className="w-1 h-1 bg-white rounded-full mt-0.5 mr-0.5"></div>
            </div>
          </div>
          <div className="w-2 h-1 bg-rose-400 rounded-full mt-1"></div>
          <div className="flex gap-0.5 mt-0.5 text-[8px] text-slate-800 font-black">
            <span>w</span>
          </div>
        </div>
      </div>

      <div className="relative w-32 h-16 bg-rose-50 rounded-3xl shadow-lg z-10 flex flex-col items-center justify-end pb-2 border border-rose-100">
        <div className="absolute top-[-5px] w-14 h-10 bg-white rounded-xl shadow-md border-4 border-pink-200 flex items-center justify-center transform -rotate-3 z-20">
          <div className="w-8 h-6 bg-rose-100 rounded flex items-center justify-center">
            <PaintBrush size={10} weight="fill" className="text-rose-300" />
          </div>
        </div>
        <div className="absolute top-0 right-4 w-4 h-5 bg-white rounded-b-md rounded-t-sm shadow-sm border border-slate-200">
          <div className="w-2 h-3 border-2 border-white rounded-r-full absolute top-1 -right-1.5"></div>
        </div>
        <div className="w-full flex justify-between px-6">
          <div className="w-3 h-6 bg-rose-200 rounded-full"></div>
          <div className="w-3 h-6 bg-rose-200 rounded-full"></div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-md border border-rose-300 z-30">
          LV.8
        </div>
      </div>
    </div>
  );
};

export default CharacterDesignerCat;
