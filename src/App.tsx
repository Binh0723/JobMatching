import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import JobListing from './pages/JobListing';
import ResumeUpload from './pages/ResumeUpload';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<JobListing />} />
            <Route path="/upload" element={<ResumeUpload />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;