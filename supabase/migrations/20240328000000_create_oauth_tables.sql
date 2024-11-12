-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful with this in production)
DROP TABLE IF EXISTS public.user_tokens;
DROP TABLE IF EXISTS public.oauth_states;

-- Create oauth_states table
CREATE TABLE public.oauth_states (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    state TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    -- Add an automatic cleanup for expired states
    CHECK (expires_at > created_at)
);

-- Create user_tokens table
CREATE TABLE public.user_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Add constraint to ensure expires_at is in the future
    CHECK (expires_at > created_at)
);

-- Create indexes for better query performance
CREATE INDEX idx_oauth_states_state ON public.oauth_states(state);
CREATE INDEX idx_oauth_states_expires_at ON public.oauth_states(expires_at);
CREATE INDEX idx_user_tokens_user_id ON public.user_tokens(user_id);
CREATE INDEX idx_user_tokens_expires_at ON public.user_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create security policies for oauth_states
CREATE POLICY "Allow insert for all users" ON public.oauth_states
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users" ON public.oauth_states
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow delete for authenticated users" ON public.oauth_states
    FOR DELETE TO authenticated USING (true);

-- Create security policies for user_tokens
CREATE POLICY "Users can view their own tokens" ON public.user_tokens
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON public.user_tokens
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.user_tokens
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" ON public.user_tokens
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_tokens_updated_at
    BEFORE UPDATE ON public.user_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired states
CREATE OR REPLACE FUNCTION cleanup_expired_states()
RETURNS void AS $$
BEGIN
    DELETE FROM public.oauth_states
    WHERE expires_at < TIMEZONE('utc'::text, NOW());
END;
$$ language 'plpgsql';

-- Create a scheduled job to clean up expired states (runs every hour)
SELECT cron.schedule(
    'cleanup-expired-oauth-states',
    '0 * * * *', -- Every hour
    'SELECT cleanup_expired_states();'
);