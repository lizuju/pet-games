import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyles from './components/layout/GlobalStyles';
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <Router basename="/">
      <GlobalStyles />
      <div className="w-full h-full flex items-center justify-center bg-indigo-100" style={{ minHeight: '100vh' }}>
        <div style={{ width: '390px', height: '844px', position: 'relative', overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
