-- ====================================================================
-- SynapseSQL Enterprise - Supabase PostgreSQL Schema
-- Run this script in your Supabase Project -> SQL Editor
-- ====================================================================

-- 1. Create user_profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'analyst', -- 'admin', 'analyst', 'viewer'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create query_logs Table (stores user prompt, model, SQL, duration, row count)
-- Note: Raw database records/results are deliberately excluded for privacy
CREATE TABLE IF NOT EXISTS public.query_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    user_email TEXT,
    user_name TEXT,
    query_text TEXT NOT NULL,
    generated_sql TEXT,
    model_name TEXT NOT NULL,
    database_type TEXT DEFAULT 'sqlite', -- 'sqlite' | 'mysql' | 'mongodb'
    status TEXT NOT NULL, -- 'success' | 'error' | 'blocked'
    execution_time_ms INTEGER DEFAULT 0,
    rows_returned INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for fast dashboard and user query history retrieval
CREATE INDEX IF NOT EXISTS idx_query_logs_user_id ON public.query_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_user_email ON public.query_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_query_logs_created_at ON public.query_logs(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) full access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Service role full access on user_profiles'
    ) THEN
        CREATE POLICY "Service role full access on user_profiles" ON public.user_profiles
            FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'query_logs' AND policyname = 'Service role full access on query_logs'
    ) THEN
        CREATE POLICY "Service role full access on query_logs" ON public.query_logs
            FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    -- Allow authenticated users to read their own profile & logs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.user_profiles
            FOR SELECT TO authenticated USING (id = auth.uid()::text);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'query_logs' AND policyname = 'Users can view own query logs'
    ) THEN
        CREATE POLICY "Users can view own query logs" ON public.query_logs
            FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
    END IF;
END $$;
