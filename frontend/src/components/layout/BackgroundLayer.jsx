import { customStyles } from '../../styles/customStyles';

const BackgroundLayer = () => {
  return (
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-indigo-50/80 to-slate-100">
      <div style={customStyles.isoGridBg}></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl"></div>
    </div>
  );
};

export default BackgroundLayer;
