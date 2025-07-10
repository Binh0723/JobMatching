import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, User } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { currentCandidate } = useApp();

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CareerMatch</span>
          </Link>

          <nav className="flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Jobs
            </Link>
            
            <Link
              to="/upload"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/upload'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Upload Resume
            </Link>

            {currentCandidate && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;