import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience_years: number;
  seniority_level: string;
  preferred_location?: string;
}

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

interface JobMatch {
  id: string;
  match_score: number;
  jobs: Job;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface AppContextType {
  currentCandidate: Candidate | null;
  setCurrentCandidate: (candidate: Candidate | null) => void;
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  recommendations: JobMatch[];
  setRecommendations: (recommendations: JobMatch[]) => void;
  pagination: PaginationInfo | null;
  setPagination: (pagination: PaginationInfo | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<JobMatch[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  return (
    <AppContext.Provider
      value={{
        currentCandidate,
        setCurrentCandidate,
        jobs,
        setJobs,
        recommendations,
        setRecommendations,
        pagination,
        setPagination,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};