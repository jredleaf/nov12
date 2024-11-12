import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleZoomCallback } from '../../utils/oauth';

const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        if (!code || !state) {
          throw new Error('Missing required parameters');
        }

        await handleZoomCallback(code, state);
        navigate('/'); // Redirect to home page after successful auth
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleAuth();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff8eb] to-[#fff1d6] p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-[#f4a61d] text-white px-4 py-2 rounded-lg hover:bg-[#d88e0c] transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8eb] to-[#fff1d6] p-6 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Authenticating...</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f4a61d]"></div>
        </div>
      </div>
    </div>
  );
};