import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Debug: Log the values being used
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key present:', !!supabaseKey);
console.log('Gemini API Key present:', !!process.env.GEMINI_API_KEY);

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase }; 