import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyles from './components/layout/GlobalStyles';
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <Router basename="/">
      <GlobalStyles />
      <div className="w-full min-h-screen flex items-center justify-center bg-indigo-100 p-4">
        <div
          style={{
            width: 'min(100vw - 32px, 420px)',
            height: 'min(100vh - 32px, 860px)',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '28px',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/index.html" element={<HomePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
