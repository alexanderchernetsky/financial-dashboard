// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FinancialDashboard from './FinancialDashboard';
import CryptoTracker from './CryptoTracker';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<FinancialDashboard />} />
            <Route path="/crypto" element={<CryptoTracker />} />
        </Routes>
    </Router>
);

export default App;
