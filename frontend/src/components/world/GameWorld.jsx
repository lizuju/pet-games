import CharacterCeoCat from './CharacterCeoCat';
import CharacterDevCat from './CharacterDevCat';
import CharacterDesignerCat from './CharacterDesignerCat';
import Plant from './Plant';

const GameWorld = ({
  onCharacterClick,
  onRestClick,
  resting,
  boostRemaining,
  cooldownRemaining,
  cooldownActive,
  activePing,
}) => {
  return (
    <div className="relative flex-1 w-full overflow-hidden z-10">
      <CharacterCeoCat onClick={() => onCharacterClick('ceo')} pinged={activePing === 'ceo'} />
      <CharacterDevCat onClick={() => onCharacterClick('dev')} pinged={activePing === 'dev'} />
      <CharacterDesignerCat onClick={() => onCharacterClick('designer')} pinged={activePing === 'designer'} />
      <Plant
        onClick={() => onCharacterClick('cactus')}
        onRestClick={onRestClick}
        resting={resting}
        boostRemaining={boostRemaining}
        cooldownRemaining={cooldownRemaining}
        cooldownActive={cooldownActive}
        pinged={activePing === 'cactus'}
      />
    </div>
  );
};

export default GameWorld;
