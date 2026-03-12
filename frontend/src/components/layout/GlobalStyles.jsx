import { useEffect } from 'react';

const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

      * { font-family: 'Nunito', sans-serif; }

      @keyframes bounce-soft {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }

      @keyframes float-up-fade {
        0% { transform: translateY(0) scale(0.8); opacity: 0; }
        20% { opacity: 1; transform: translateY(-10px) scale(1); }
        80% { opacity: 1; transform: translateY(-30px) scale(1); }
        100% { transform: translateY(-40px) scale(0.8); opacity: 0; }
      }

      @keyframes type-jiggle {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-1px) rotate(-1deg); }
        75% { transform: translateY(-1px) rotate(1deg); }
      }

      @keyframes pulse-ring {
        0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }

      html, body, #root {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #e0e7ff;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return null;
};

export default GlobalStyles;
