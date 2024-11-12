import { useState, useEffect, useRef } from 'react';

export function useAudio(audioUrl: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    
    const handleCanPlayThrough = () => {
      setIsLoaded(true);
      setError(null);
    };

    const handleError = () => {
      setError(`Failed to load audio: ${audioUrl}`);
      setIsLoaded(false);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);
    
    audio.volume = 0.3;
    audio.preload = 'auto';
    
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  const play = async () => {
    try {
      if (audioRef.current && isLoaded) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  return { play, error, isLoaded };
}