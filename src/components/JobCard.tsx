import React from 'react';
import { MapPin, Clock, DollarSign, Briefcase, Wifi } from 'lucide-react';

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
  matchScore?: number;
  onClick?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, matchScore, onClick }) => {
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-lg text-gray-600">{job.company}</p>
        </div>
        {matchScore !== undefined && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(matchScore)}`}>
            {matchScore}% Match
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.requirements.slice(0, 4).map((skill, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
          >
            {skill}
          </span>
        ))}
        {job.requirements.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">
            +{job.requirements.length - 4} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          {job.remote_friendly && (
            <div className="flex items-center space-x-1">
              <Wifi className="h-4 w-4" />
              <span>Remote</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Briefcase className="h-4 w-4" />
            <span className="capitalize">{job.experience_level.replace('-', ' ')}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>{job.salary_range}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;