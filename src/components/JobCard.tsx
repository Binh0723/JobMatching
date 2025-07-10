import React from 'react';
import { MapPin, Building, Clock, DollarSign, Star } from 'lucide-react';

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

interface JobCardProps {
  job: Job;
  matchScore: number;
}

const JobCard: React.FC<JobCardProps> = ({ job, matchScore }) => {
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <Building className="h-4 w-4 mr-2" />
            <span>{job.company}</span>
          </div>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{job.location}</span>
            {job.remote_friendly && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Remote
              </span>
            )}
          </div>
        </div>
        
        {/* Match Score Badge */}
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(matchScore)}`}>
            <Star className="h-4 w-4 mr-1" />
            {matchScore}% Match
          </div>
          <div className="text-xs text-gray-500 mt-1">{getMatchLabel(matchScore)}</div>
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.requirements.slice(0, 5).map((requirement, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
          >
            {requirement}
          </span>
        ))}
        {job.requirements.length > 5 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            +{job.requirements.length - 5} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span className="capitalize">{job.experience_level.replace('-', ' ')}</span>
        </div>
        {job.salary_range && (
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>{job.salary_range}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;