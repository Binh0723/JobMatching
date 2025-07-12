import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase } from 'lucide-react';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import PageSizeSelector from '../components/PageSizeSelector';
import { useApp } from '../contexts/AppContext';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary_range?: string;
  requirements: string[];
  experience_level: string;
  employment_type: string;
  remote_friendly: boolean;
}

const JobListing: React.FC = () => {
  const { jobs, setJobs, pagination, setPagination } = useApp();
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    fetchJobs(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Add debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || locationFilter || experienceFilter || remoteFilter) {
        searchJobs(1, pageSize);
        setCurrentPage(1); // Reset to first page when filters change
      } else {
        fetchJobs(1, pageSize);
        setCurrentPage(1); // Reset to first page when clearing filters
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, locationFilter, experienceFilter, remoteFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Fetch jobs for the new page with current filters
    if (searchTerm || locationFilter || experienceFilter || remoteFilter) {
      searchJobs(page, pageSize);
    } else {
      fetchJobs(page, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    // Fetch jobs with new page size and current filters
    if (searchTerm || locationFilter || experienceFilter || remoteFilter) {
      searchJobs(1, newPageSize);
    } else {
      fetchJobs(1, newPageSize);
    }
  };

  const fetchJobs = async (page = 1, limit = 12) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/jobs?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchJobs = async (page = 1, limit = 12) => {
    try {
      setSearchLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
        location: locationFilter,
        experience: experienceFilter,
        remote: remoteFilter.toString()
      });
      
      const response = await fetch(`/api/jobs/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search jobs');
      }
      const data = await response.json();
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error searching jobs:', error);
      setError('Failed to search jobs. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setExperienceFilter('');
    setRemoteFilter(false);
    setCurrentPage(1);
  };

  // Remove the client-side filtering since we're now using server-side search
  // const filteredJobs = jobs.filter(job => { ... });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Find Your Dream Career
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover personalized job opportunities that match your skills and aspirations
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="City, State"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Levels</option>
                  <option value="entry-level">Entry Level</option>
                  <option value="mid-level">Mid Level</option>
                  <option value="senior-level">Senior Level</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remote"
                checked={remoteFilter}
                onChange={(e) => setRemoteFilter(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remote" className="ml-2 block text-sm text-gray-700">
                Remote Friendly
              </label>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {jobs.length} Job{jobs.length !== 1 ? 's' : ''} Found
            </h2>
            {(searchTerm || locationFilter || experienceFilter || remoteFilter) && (
              <p className="text-sm text-gray-600 mt-1">
                Showing results for: {searchTerm && `"${searchTerm}"`} {locationFilter && `in ${locationFilter}`} {experienceFilter && `(${experienceFilter})`} {remoteFilter && '(Remote only)'}
              </p>
            )}
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Pagination Controls */}
        {pagination && (
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <PageSizeSelector
              currentPageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              options={[6, 12, 24, 48]}
            />
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Briefcase className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListing;