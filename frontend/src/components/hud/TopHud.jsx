import ResourceBar from './ResourceBar';
import LevelBar from './LevelBar';

const TopHud = ({
  money,
  moneyRate,
  fish,
  staffCount,
  maxStaff,
  level,
  levelProgress,
  onMoneyClick,
  onFishClick,
}) => {
  return (
    <div className="relative z-50 pt-6 px-4 flex flex-col gap-3 w-full pointer-events-none">
      <ResourceBar
        money={money}
        moneyRate={moneyRate}
        fish={fish}
        staffCount={staffCount}
        maxStaff={maxStaff}
        onMoneyClick={onMoneyClick}
        onFishClick={onFishClick}
      />
      <LevelBar level={level} progress={levelProgress} />
    </div>
  );
};

export default TopHud;
