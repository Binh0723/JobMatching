import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all jobs
export async function getAllJobs(req, res) {
  try {
    const { page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get total count
    const { count: totalJobs, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get jobs with pagination
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    // Calculate pagination info
    const totalPages = Math.ceil(totalJobs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      jobs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalJobs,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}

// Get job details
export async function getJobDetails(req, res) {
  try {
    const { id } = req.params;
    
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
}

// Create sample jobs for testing
export async function createSampleJobs(req, res) {
  try {
    const sampleJobs = [
      // Entry-level Software Engineer positions
      {
        title: "Software Engineer - Backend",
        company: "Microsoft",
        description: "Join our Azure team to build scalable cloud services. Work with Java, Spring Boot, and AWS technologies. Perfect for recent CS graduates with cloud experience.",
        location: "Seattle, WA",
        salary_range: "$85,000 - $110,000",
        requirements: ["Java", "Spring Boot", "AWS", "REST API", "Docker", "Git"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Full Stack Developer",
        company: "Google",
        description: "Build next-generation web applications using React, TypeScript, and Node.js. Work on projects that impact millions of users worldwide.",
        location: "Mountain View, CA",
        salary_range: "$90,000 - $120,000",
        requirements: ["JavaScript", "React", "TypeScript", "Node.js", "Python", "AWS"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Cloud Software Engineer",
        company: "Amazon Web Services",
        description: "Develop AWS services and tools. Work with distributed systems, Java, and cloud technologies. Leverage your AWS internship experience.",
        location: "Seattle, WA",
        salary_range: "$95,000 - $125,000",
        requirements: ["Java", "AWS", "DynamoDB", "Lambda", "CloudWatch", "Python"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: false
      },
      {
        title: "Backend Engineer",
        company: "Netflix",
        description: "Build microservices and APIs that serve millions of users. Work with Java, Spring, and cloud-native technologies.",
        location: "Los Gatos, CA",
        salary_range: "$100,000 - $130,000",
        requirements: ["Java", "Spring", "REST API", "Docker", "AWS", "Microservices"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Software Engineer - Infrastructure",
        company: "Meta",
        description: "Develop tools and systems for managing large-scale infrastructure. Work with Python, Go, and distributed systems.",
        location: "Menlo Park, CA",
        salary_range: "$95,000 - $125,000",
        requirements: ["Python", "Go", "Docker", "AWS", "CI/CD", "Monitoring"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "DevOps Engineer",
        company: "Salesforce",
        description: "Automate deployment pipelines and manage cloud infrastructure. Work with AWS, Docker, and monitoring tools.",
        location: "San Francisco, CA",
        salary_range: "$90,000 - $115,000",
        requirements: ["AWS", "Docker", "CI/CD", "Python", "Monitoring", "Linux"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Software Engineer - Data",
        company: "Uber",
        description: "Build data pipelines and analytics systems. Work with Python, SQL, and big data technologies.",
        location: "San Francisco, CA",
        salary_range: "$95,000 - $125,000",
        requirements: ["Python", "SQL", "AWS", "Data Analysis", "MongoDB", "Redis"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Cloud Developer",
        company: "Oracle",
        description: "Develop cloud-native applications using Oracle Cloud Infrastructure. Work with Java, Python, and container technologies.",
        location: "Austin, TX",
        salary_range: "$85,000 - $110,000",
        requirements: ["Java", "Python", "Docker", "Cloud", "REST API", "SQL"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Software Engineer - Platform",
        company: "Airbnb",
        description: "Build the platform that powers millions of bookings. Work with React, TypeScript, and microservices.",
        location: "San Francisco, CA",
        salary_range: "$100,000 - $130,000",
        requirements: ["React", "TypeScript", "Node.js", "AWS", "Microservices", "Docker"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Backend Developer",
        company: "Spotify",
        description: "Develop APIs and services for music streaming. Work with Java, Spring, and cloud technologies.",
        location: "New York, NY",
        salary_range: "$90,000 - $120,000",
        requirements: ["Java", "Spring", "AWS", "REST API", "Docker", "MongoDB"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Software Engineer - AI/ML",
        company: "OpenAI",
        description: "Build AI-powered applications and tools. Work with Python, machine learning, and cloud infrastructure.",
        location: "San Francisco, CA",
        salary_range: "$110,000 - $140,000",
        requirements: ["Python", "Machine Learning", "AWS", "LangChain", "React", "TypeScript"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Full Stack Engineer",
        company: "Stripe",
        description: "Build payment infrastructure and developer tools. Work with React, TypeScript, and backend services.",
        location: "San Francisco, CA",
        salary_range: "$105,000 - $135,000",
        requirements: ["React", "TypeScript", "Node.js", "AWS", "Docker", "Git"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Software Engineer - Security",
        company: "Palantir",
        description: "Build secure applications and data platforms. Work with Java, Python, and security technologies.",
        location: "Palo Alto, CA",
        salary_range: "$100,000 - $130,000",
        requirements: ["Java", "Python", "Security", "AWS", "Docker", "Linux"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: false
      },
      {
        title: "Cloud Infrastructure Engineer",
        company: "Twilio",
        description: "Manage and scale cloud infrastructure. Work with AWS, Docker, and automation tools.",
        location: "San Francisco, CA",
        salary_range: "$95,000 - $125,000",
        requirements: ["AWS", "Docker", "Python", "CI/CD", "Monitoring", "Linux"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Software Engineer - Gaming",
        company: "Electronic Arts",
        description: "Develop game services and backend systems. Work with C++, Python, and cloud technologies.",
        location: "Redwood City, CA",
        salary_range: "$90,000 - $120,000",
        requirements: ["C++", "Python", "AWS", "Game Development", "Docker", "Git"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "API Developer",
        company: "GitHub",
        description: "Build APIs and developer tools. Work with REST APIs, Python, and cloud infrastructure.",
        location: "San Francisco, CA",
        salary_range: "$95,000 - $125,000",
        requirements: ["REST API", "Python", "AWS", "Docker", "Git", "Node.js"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Software Engineer - Monitoring",
        company: "Datadog",
        description: "Build monitoring and observability tools. Work with Python, Go, and distributed systems.",
        location: "New York, NY",
        salary_range: "$100,000 - $130,000",
        requirements: ["Python", "Go", "Monitoring", "AWS", "Docker", "Distributed Systems"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Backend Engineer - E-commerce",
        company: "Shopify",
        description: "Build scalable e-commerce platforms. Work with Ruby, Python, and cloud technologies.",
        location: "Ottawa, Canada",
        salary_range: "$85,000 - $115,000",
        requirements: ["Ruby", "Python", "AWS", "REST API", "Docker", "SQL"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Software Engineer - Data Platform",
        company: "Snowflake",
        description: "Build data processing and analytics platforms. Work with Java, Python, and big data technologies.",
        location: "San Mateo, CA",
        salary_range: "$105,000 - $135,000",
        requirements: ["Java", "Python", "Big Data", "AWS", "Docker", "SQL"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      },
      {
        title: "Cloud Solutions Engineer",
        company: "VMware",
        description: "Develop cloud-native applications and solutions. Work with Java, Python, and virtualization technologies.",
        location: "Palo Alto, CA",
        salary_range: "$90,000 - $120,000",
        requirements: ["Java", "Python", "Cloud", "Docker", "AWS", "Virtualization"],
        experience_level: "entry-level",
        employment_type: "full-time",
        remote_friendly: true
      }
    ];

    const { data, error } = await supabase
      .from('jobs')
      .insert(sampleJobs)
      .select();

    if (error) throw error;

    res.json({ 
      message: `Successfully created ${data.length} sample jobs`,
      jobs: data 
    });
  } catch (error) {
    console.error('Error creating sample jobs:', error);
    res.status(500).json({ error: 'Failed to create sample jobs' });
  }
}

// Search jobs with filters
export async function searchJobs(req, res) {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search = '', 
      location = '', 
      experience = '', 
      remote = '' 
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // --- Build count query ---
    let countQuery = supabase.from('jobs').select('*', { count: 'exact', head: true });
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (location) {
      countQuery = countQuery.ilike('location', `%${location}%`);
    }
    if (experience) {
      countQuery = countQuery.eq('experience_level', experience);
    }
    if (remote === 'true') {
      countQuery = countQuery.eq('remote_friendly', true);
    }
    const { count: totalJobs, error: countError } = await countQuery;
    if (countError) {
      console.error('Count error:', countError);
      throw countError;
    }

    // --- Build data query ---
    let dataQuery = supabase.from('jobs').select('*');
    if (search) {
      dataQuery = dataQuery.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (location) {
      dataQuery = dataQuery.ilike('location', `%${location}%`);
    }
    if (experience) {
      dataQuery = dataQuery.eq('experience_level', experience);
    }
    if (remote === 'true') {
      dataQuery = dataQuery.eq('remote_friendly', true);
    }
    const { data: jobs, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);
    if (error) {
      console.error('Data error:', error);
      throw error;
    }

    // Calculate pagination info
    const totalPages = Math.ceil((totalJobs || 0) / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      jobs: jobs || [],
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalJobs || 0,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
}

 