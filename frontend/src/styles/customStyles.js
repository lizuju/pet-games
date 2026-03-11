export const customStyles = {
  bounceSoft: {
    animation: 'bounce-soft 3s infinite ease-in-out',
  },
  particleFloat: {
    animation: 'float-up-fade 2.5s infinite ease-in-out',
  },
  particleFloat2: {
    animation: 'float-up-fade 2.5s infinite ease-in-out',
    animationDelay: '1.2s',
  },
  bounceSoftDelayed: {
    animation: 'bounce-soft 3s infinite ease-in-out',
    animationDelay: '0.5s',
  },
  typing: {
    animation: 'type-jiggle 0.15s infinite',
  },
  pulseRing: {
    animation: 'pulse-ring 2s infinite',
  },
  isoGridBg: {
    backgroundSize: '50px 50px',
    backgroundImage:
      'linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
    transform: 'rotateX(60deg) rotateZ(45deg)',
    transformOrigin: 'center center',
    width: '300%',
    height: '300%',
    position: 'absolute',
    top: '-100%',
    left: '-100%',
    pointerEvents: 'none',
  },
  catEarLeft: {
    borderRadius: '12px 4px 0 0',
    transform: 'skewX(-15deg)',
  },
  catEarRight: {
    borderRadius: '4px 12px 0 0',
    transform: 'skewX(15deg)',
  },
};
