import axios from 'axios';

const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';
const ZOOM_AUTH_URL = 'https://zoom.us/oauth/token';

interface ZoomTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export const generateZoomAccessToken = async (): Promise<string | null> => {
  try {
    const clientId = import.meta.env.VITE_ZOOM_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_ZOOM_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Zoom OAuth credentials');
    }

    const authHeader = btoa(`${clientId}:${clientSecret}`);

    const response = await axios.post<ZoomTokenResponse>(
      ZOOM_AUTH_URL,
      new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: 'me', // Use 'me' for user-level access
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error generating Zoom access token:', error);
    return null;
  }
};

export const makeZoomApiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T | null> => {
  try {
    const accessToken = await generateZoomAccessToken();
    
    if (!accessToken) {
      throw new Error('Failed to generate access token');
    }

    const response = await axios({
      method,
      url: `${ZOOM_API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data,
    });

    return response.data;
  } catch (error) {
    console.error('Error making Zoom API request:', error);
    return null;
  }
};

// Example API functions
export const getCurrentUser = async () => {
  return makeZoomApiRequest('/users/me');
};

export const getMeeting = async (meetingId: string) => {
  return makeZoomApiRequest(`/meetings/${meetingId}`);
};

export const createMeeting = async (userId: string, meetingData: any) => {
  return makeZoomApiRequest(`/users/${userId}/meetings`, 'POST', meetingData);
};