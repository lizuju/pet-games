import { Armchair, ArrowUp, Cat, ClipboardText, Storefront } from '@phosphor-icons/react';
import { customStyles } from '../../styles/customStyles';

const TabButton = ({
  id,
  label,
  Icon,
  activeTab,
  onTabChange,
  activeClass,
  idleClass,
  activeTextClass,
  idleTextClass,
}) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => onTabChange(id)}
      className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50 transition-colors group ${isActive ? 'bg-slate-50' : ''}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${isActive ? activeClass : idleClass}`}>
        <Icon size={20} weight="fill" />
      </div>
      <span className={`text-[10px] font-extrabold uppercase tracking-wider transition-colors ${isActive ? activeTextClass : idleTextClass}`}>
        {label}
      </span>
    </button>
  );
};

const BottomNav = ({ activeTab, onTabChange, onPrimaryAction }) => {
  return (
    <div className="relative z-50 px-4 pb-6 pt-10 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-2 shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white flex justify-between items-center pointer-events-auto relative">
        <TabButton
          id="desks"
          label="Desks"
          Icon={Armchair}
          activeTab={activeTab}
          onTabChange={onTabChange}
          activeClass="bg-blue-100 text-blue-600"
          idleClass="bg-blue-50 text-blue-500 group-hover:bg-blue-100"
          activeTextClass="text-blue-500"
          idleTextClass="text-slate-400 group-hover:text-blue-500"
        />

        <button
          onClick={() => onTabChange('tasks')}
          className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50 transition-colors group relative ${activeTab === 'tasks' ? 'bg-slate-50' : ''}`}
        >
          <div className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white z-10 animate-pulse"></div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${activeTab === 'tasks' ? 'bg-amber-100 text-amber-600' : 'bg-amber-50 text-amber-500 group-hover:bg-amber-100'}`}>
            <ClipboardText size={20} weight="fill" />
          </div>
          <span className={`text-[10px] font-extrabold uppercase tracking-wider transition-colors ${activeTab === 'tasks' ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'}`}>Tasks</span>
        </button>

        <div className="relative w-16 h-16 -mt-12 mx-1 flex-shrink-0">
          <div className="absolute inset-0 bg-emerald-400 rounded-full" style={customStyles.pulseRing}></div>
          <button
            onClick={onPrimaryAction}
            className="absolute inset-0 w-full h-full bg-gradient-to-tr from-emerald-400 to-emerald-500 rounded-full shadow-[0_10px_25px_rgba(52,211,153,0.5)] border-4 border-white flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all z-10 group"
          >
            <ArrowUp size={24} weight="fill" className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        <TabButton
          id="staff"
          label="Staff"
          Icon={Cat}
          activeTab={activeTab}
          onTabChange={onTabChange}
          activeClass="bg-purple-100 text-purple-600"
          idleClass="bg-purple-50 text-purple-500 group-hover:bg-purple-100"
          activeTextClass="text-purple-500"
          idleTextClass="text-slate-400 group-hover:text-purple-500"
        />

        <TabButton
          id="shop"
          label="Shop"
          Icon={Storefront}
          activeTab={activeTab}
          onTabChange={onTabChange}
          activeClass="bg-rose-100 text-rose-600"
          idleClass="bg-rose-50 text-rose-500 group-hover:bg-rose-100"
          activeTextClass="text-rose-500"
          idleTextClass="text-slate-400 group-hover:text-rose-500"
        />
      </div>
    </div>
  );
};

export default BottomNav;
