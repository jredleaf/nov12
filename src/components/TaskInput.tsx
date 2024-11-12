import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TaskInputProps {
  onTaskAdd: (task: string) => void;
  disabled: boolean;
}

function TaskInput({ onTaskAdd, disabled }: TaskInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (inputValue.trim() && isTyping) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        if (inputValue.trim()) {
          onTaskAdd(inputValue.trim());
          setInputValue('');
          setIsTyping(false);
        }
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputValue, isTyping, onTaskAdd]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsTyping(true);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={disabled ? "Complete a task to add more" : "What needs to be done?"}
        maxLength={100}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4a61d] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700"
        disabled={disabled}
      />
      {isTyping && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Adding in 2s...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskInput;