-- Create oauth_states table
CREATE TABLE IF NOT EXISTS public.oauth_states (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    state TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create user_tokens table
CREATE TABLE IF NOT EXISTS public.user_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX oauth_states_state_idx ON public.oauth_states(state);
CREATE INDEX user_tokens_user_id_idx ON public.user_tokens(user_id);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users only" ON public.oauth_states
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.oauth_states
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.oauth_states
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable all for users based on user_id" ON public.user_tokens
    FOR ALL TO authenticated USING (auth.uid() = user_id);