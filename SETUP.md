# Local Development Setup

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Server Configuration (optional)
PORT=3001
```

### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Replace the placeholder values in your `.env` file

## Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Run the migration file: `supabase/migrations/20250710195238_frosty_surf.sql`
3. This will create the necessary tables and sample data

## Running the Application

```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Express) servers concurrently. 