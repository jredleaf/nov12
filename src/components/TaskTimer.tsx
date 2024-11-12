import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Pause, Play, Edit } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { useGlobalTimer } from '../hooks/useGlobalTimer';
import { useAudio } from '../hooks/useAudio';

interface TaskTimerProps {
  taskId: string;
  showOptions?: boolean;
}

function TaskTimer({ taskId, showOptions = false }: TaskTimerProps) {
  const [showTimer, setShowTimer] = useState(false);
  const [time, setTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [inputError, setInputError] = useState('');
  const [isWideScreen, setIsWideScreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { runningTimerId, setRunningTimer, clearTimer } = useGlobalTimer();
  const supabase = createClient();
  const { play: playChime, error: audioError } = useAudio('/sounds/Chime.mp3');

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsWideScreen(window.innerWidth >= 640);
    };

    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);

  useEffect(() => {
    if (runningTimerId && runningTimerId !== taskId) {
      setIsRunning(false);
      setTime(null);
    }
  }, [runningTimerId, taskId]);

  const updateTaskTimer = useCallback(async (minutes: number) => {
    if (taskId === 'new') return;

    try {
      const { error } = await supabase
        .from('Tasks')
        .update({
          timer_used: true,
          timer_length_used: minutes
        })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task timer:', error);
    }
  }, [taskId, supabase]);

  useEffect(() => {
    if (isRunning && time !== null && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime === null || prevTime <= 0) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            clearTimer();
            playChime().catch(console.error);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isRunning, clearTimer, playChime]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowTimer(false);
        setShowCustomInput(false);
        setCustomMinutes('');
        setInputError('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateCustomMinutes = (value: string): boolean => {
    const minutes = parseInt(value, 10);
    if (isNaN(minutes)) {
      setInputError('Please enter a valid number');
      return false;
    }
    if (minutes <= 0) {
      setInputError('Minutes must be greater than 0');
      return false;
    }
    if (minutes > 180) {
      setInputError('Maximum 180 minutes allowed');
      return false;
    }
    setInputError('');
    return true;
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateCustomMinutes(customMinutes)) {
      return;
    }

    const minutes = parseInt(customMinutes, 10);
    setTime(minutes * 60);
    setIsRunning(true);
    setShowTimer(false);
    setShowCustomInput(false);
    setCustomMinutes('');
    setInputError('');
    setRunningTimer(taskId, minutes * 60);
    await updateTaskTimer(minutes);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomMinutes(value);
    if (value) {
      validateCustomMinutes(value);
    } else {
      setInputError('');
    }
  };

  const handlePresetTime = async (minutes: number) => {
    setTime(minutes * 60);
    setIsRunning(true);
    setShowTimer(false);
    setRunningTimer(taskId, minutes * 60);
    await updateTaskTimer(minutes);
  };

  const toggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) {
      clearTimer();
    } else {
      setRunningTimer(taskId, time);
    }
    setIsRunning(!isRunning);
  };

  const presetTimes = [
    { label: '15m', value: 15 },
    { label: '25m', value: 25 },
    { label: '50m', value: 50 },
  ];

  if (!isWideScreen || !showOptions) {
    return (
      <div className="flex items-center gap-2">
        {time !== null && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimer}
              className="p-1.5 text-[#f4a61d] hover:bg-[#fff8eb] rounded-full transition-colors"
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <span className="font-mono text-sm text-[#f4a61d]">
              {formatTime(time)}
            </span>
          </div>
        )}
        
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowTimer(!showTimer);
            }}
            className="p-2 text-[#f4a61d] hover:bg-[#fff8eb] rounded-full transition-colors"
          >
            <Clock size={20} />
          </button>

          {showTimer && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                {presetTimes.map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => handlePresetTime(value)}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-[#fff8eb] rounded transition-colors"
                  >
                    {label}
                  </button>
                ))}
                
                {!showCustomInput ? (
                  <button
                    onClick={() => {
                      setShowCustomInput(true);
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-[#fff8eb] rounded transition-colors"
                  >
                    Custom
                  </button>
                ) : (
                  <form onSubmit={handleCustomSubmit} className="mt-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          ref={inputRef}
                          type="number"
                          min="1"
                          max="180"
                          value={customMinutes}
                          onChange={handleCustomInputChange}
                          placeholder="mins"
                          className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#f4a61d] ${
                            inputError ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 text-sm bg-[#f4a61d] text-white rounded hover:bg-[#d88e0c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!!inputError || !customMinutes}
                        >
                          Set
                        </button>
                      </div>
                      {inputError && (
                        <p className="text-xs text-red-500">{inputError}</p>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {time !== null && (
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTimer}
            className="p-1.5 text-[#f4a61d] hover:bg-[#fff8eb] rounded-full transition-colors"
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <span className="font-mono text-sm text-[#f4a61d]">
            {formatTime(time)}
          </span>
        </div>
      )}
      
      <div className="flex items-center bg-[#fff8eb] rounded-full px-2 py-1 gap-2">
        <Clock size={16} className="text-[#f4a61d]" />
        {presetTimes.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => handlePresetTime(value)}
            className="px-2 py-0.5 text-sm text-[#f4a61d] hover:bg-[#fff1d6] rounded-full transition-colors"
          >
            {label}
          </button>
        ))}
        
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowCustomInput(true);
              setShowTimer(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="p-1 text-[#f4a61d] hover:bg-[#fff1d6] rounded-full transition-colors"
          >
            <Edit size={16} />
          </button>

          {showTimer && showCustomInput && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleCustomSubmit}>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="number"
                      min="1"
                      max="180"
                      value={customMinutes}
                      onChange={handleCustomInputChange}
                      placeholder="mins"
                      className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#f4a61d] ${
                        inputError ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 text-sm bg-[#f4a61d] text-white rounded hover:bg-[#d88e0c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!!inputError || !customMinutes}
                    >
                      Set
                    </button>
                  </div>
                  {inputError && (
                    <p className="text-xs text-red-500">{inputError}</p>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskTimer;