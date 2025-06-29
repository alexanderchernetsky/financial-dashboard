// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FinancialDashboard from './FinancialDashboard';
import CryptoTracker from './CryptoTracker';

// Create a react-query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        },
    },
});

const App = () => (
    <QueryClientProvider client={queryClient}>
        <Router>
            <Routes>
                    <Route path="/" element={<FinancialDashboard />} />
                    <Route path="/crypto" element={<CryptoTracker />} />
            </Routes>
        </Router>
    </QueryClientProvider>
);

export default App;
