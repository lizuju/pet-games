import { customStyles } from '../../styles/customStyles';

const CharacterDevCat = ({ onClick, pinged }) => {
  return (
    <div
      onClick={onClick}
      className={`absolute top-[35%] left-[5%] w-32 flex flex-col items-center z-20 cursor-pointer idle-float idle-wiggle ${pinged ? 'scale-105' : ''}`}
      style={{ animationDelay: '0.8s' }}
    >
      {pinged && (
        <div className="absolute -top-3 right-2 bg-slate-800 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          +fish
        </div>
      )}
      <div className="absolute -top-8 flex flex-col items-center">
        <div className="bg-slate-800 text-white px-2 py-0.5 rounded shadow-sm text-[10px] font-mono mb-1" style={customStyles.particleFloat}>{'code'}</div>
      </div>

      <div className="relative w-20 h-20 mb-[-12px] z-20 hover:scale-105 transition-transform cursor-pointer" style={customStyles.typing}>
        <div className="absolute top-1 left-2 w-6 h-6 bg-slate-800" style={customStyles.catEarLeft}></div>
        <div className="absolute top-1 right-2 w-6 h-6 bg-slate-800" style={customStyles.catEarRight}></div>

        <div className="absolute top-5 w-20 h-16 bg-slate-700 rounded-2xl shadow-inner flex flex-col items-center overflow-hidden border-b-4 border-slate-900">
          <div className="flex gap-1 mt-4 z-10">
            <div className="w-6 h-4 border-2 border-emerald-400 rounded-md bg-white/10 backdrop-blur-sm"></div>
            <div className="w-2 h-0.5 bg-emerald-400 mt-1.5"></div>
            <div className="w-6 h-4 border-2 border-emerald-400 rounded-md bg-white/10 backdrop-blur-sm"></div>
          </div>
          <div className="absolute top-5 flex gap-5 opacity-80">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="w-1.5 h-1 bg-rose-400 rounded-full mt-1 z-10"></div>
          <div className="absolute top-2 w-full h-10 border-t-4 border-slate-900 rounded-t-full rounded-b-none pointer-events-none z-20"></div>
          <div className="absolute top-6 -left-1 w-3 h-6 bg-slate-900 rounded-full z-20"></div>
          <div className="absolute top-6 -right-1 w-3 h-6 bg-slate-900 rounded-full z-20"></div>
        </div>
      </div>

      <div className="relative w-28 h-24 bg-white rounded-xl shadow-lg z-10 flex flex-col items-center border border-slate-100">
        <div className="absolute top-0 w-full h-6 bg-slate-50 rounded-t-xl border-b border-slate-200"></div>
        <div className="absolute top-[-15px] flex gap-1">
          <div className="w-12 h-10 bg-slate-800 rounded p-0.5 shadow-md flex flex-col transform -rotate-6">
            <div className="w-full flex-1 bg-slate-900 rounded text-[6px] text-emerald-400 p-1 font-mono overflow-hidden">
              &gt;_ <br />run.sh
            </div>
          </div>
          <div className="w-14 h-10 bg-slate-800 rounded p-0.5 shadow-md flex flex-col transform rotate-6">
            <div className="w-full flex-1 bg-slate-900 rounded text-[6px] text-blue-400 p-1 overflow-hidden">
              <div className="w-full h-1 bg-blue-500/30 mb-0.5"></div>
              <div className="w-3/4 h-1 bg-blue-500/30 mb-0.5"></div>
              <div className="w-1/2 h-1 bg-blue-500/30"></div>
            </div>
          </div>
        </div>
        <div className="mt-8 w-16 h-2 bg-slate-200 rounded-full"></div>
        <div className="w-8 h-12 bg-slate-200 mt-1 rounded"></div>
        <div className="absolute -right-2 -bottom-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md border border-blue-300">
          LV.5
        </div>
      </div>
    </div>
  );
};

export default CharacterDevCat;
