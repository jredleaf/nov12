import { createClient } from './supabase/client';

const ZOOM_AUTH_URL = 'https://zoom.us/oauth/authorize';
const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token';
const CLIENT_ID = 'NSh56DCoTsusnAH4zEiX0A';
const CLIENT_SECRET = '4wFKAA0CSDewsbZ_jd2_Pw';
const REDIRECT_URI = 'https://enchanting-melomakarona-031069.netlify.app/auth/callback';

export const getZoomAuthUrl = (state: string) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state: state
  });

  return `${ZOOM_AUTH_URL}?${params.toString()}`;
};

export const getZoomToken = async (code: string): Promise<any> => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI
  });

  const response = await fetch(ZOOM_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  return response.json();
};

export const handleZoomCallback = async (code: string, state: string) => {
  try {
    const supabase = createClient();
    
    // Verify state parameter matches what we stored
    const { data: storedState } = await supabase
      .from('oauth_states')
      .select('state')
      .eq('state', state)
      .single();

    if (!storedState) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for token
    const tokenData = await getZoomToken(code);

    // Store the tokens securely
    const { error } = await supabase
      .from('user_tokens')
      .upsert({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      });

    if (error) {
      throw error;
    }

    // Clean up the used state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    return tokenData;
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
};