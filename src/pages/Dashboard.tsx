import React, { useState, useEffect } from 'react';
import { User, Award, Clock, MapPin, TrendingUp, Star } from 'lucide-react';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import PageSizeSelector from '../components/PageSizeSelector';
import { useApp } from '../contexts/AppContext';

interface JobMatch {
  id: string;
  match_score: number;
  jobs: {
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
  };
}

const Dashboard: React.FC = () => {
  const { currentCandidate, recommendations, setRecommendations, pagination, setPagination } = useApp();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (currentCandidate) {
      fetchDashboardData(currentPage, pageSize);
    }
  }, [currentCandidate, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const fetchDashboardData = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/candidate/${currentCandidate?.id}/dashboard?page=${page}&limit=${limit}`);
      const data = await response.json();
      setRecommendations(data.recommendations);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentCandidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please upload your resume first</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  const highMatchJobs = recommendations.filter(job => job.match_score >= 70);
  const averageMatchScore = recommendations.length > 0 
    ? Math.round(recommendations.reduce((sum, job) => sum + job.match_score, 0) / recommendations.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {currentCandidate.name}
            </h1>
            <p className="text-blue-100">
              Your personalized career dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Insights */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Profile Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Seniority Level</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {currentCandidate.seniority_level.replace('-', ' ')}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Experience</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentCandidate.experience_years} Year{currentCandidate.experience_years !== 1 ? 's' : ''}
                  </p>
                </div>

                {currentCandidate.preferred_location && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Preferred Location</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentCandidate.preferred_location}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h3>
              <div className="flex flex-wrap gap-2">
                {currentCandidate.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Matches</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pagination ? pagination.totalItems : recommendations.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">High Matches</p>
                    <p className="text-2xl font-bold text-gray-900">{highMatchJobs.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg. Match Score</p>
                    <p className="text-2xl font-bold text-gray-900">{averageMatchScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Recommendations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Recommended Jobs for You
                </h2>
                {pagination && pagination.totalItems > recommendations.length && (
                  <p className="text-sm text-gray-600">
                    Showing {recommendations.length} of {pagination.totalItems} matches
                  </p>
                )}
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-6">
                  {recommendations.map((match) => (
                    <JobCard
                      key={match.id}
                      job={match.jobs}
                      matchScore={match.match_score}
                    />
                  ))}
                  
                  {/* Pagination Controls */}
                  {pagination && (
                    <div className="mt-8">
                      {pagination.totalPages > 1 && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        💡 You have {pagination.totalItems} job matches! Use the pagination controls below to see more opportunities.
                      </p>
                    </div>
                  )}
                      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <PageSizeSelector
                          currentPageSize={pageSize}
                          onPageSizeChange={handlePageSizeChange}
                          options={[10, 20, 50, 100]}
                        />
                        <Pagination
                          currentPage={pagination.currentPage}
                          totalPages={pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matching jobs found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We couldn't find any jobs that match your experience level and skills. 
                    This might be because your field is specialized or we don't have relevant positions in our database yet.
                  </p>
                  <div className="mt-6">
                    <button 
                      onClick={() => window.location.href = '/upload'}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Upload a Different Resume
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;