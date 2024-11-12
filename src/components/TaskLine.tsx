import React, { useState, useEffect, useRef } from 'react';
import { Square, Trash2, GripVertical } from 'lucide-react';
import TaskTimer from './TaskTimer';

interface TaskLineProps {
  task: { id: string; task: string } | null;
  onComplete: (taskId: string) => void;
  onTaskAdd: (task: string) => void;
  onDelete?: (taskId: string) => void;
  placeholder?: string;
  onNameNeeded?: () => void;
  isUserLoggedIn: boolean;
}

const TaskLine: React.FC<TaskLineProps> = ({ 
  task, 
  onComplete, 
  onTaskAdd, 
  onDelete, 
  placeholder = "What needs to be done?",
  onNameNeeded,
  isUserLoggedIn
}) => {
  const [isEditing, setIsEditing] = useState(!task);
  const [inputValue, setInputValue] = useState(task?.task || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current && isUserLoggedIn) {
      inputRef.current.focus();
    }
  }, [isEditing, isUserLoggedIn]);

  useEffect(() => {
    setInputValue(task?.task || '');
  }, [task?.task]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUserLoggedIn) {
      onNameNeeded?.();
      return;
    }
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowTimer(newValue.length > 0);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isUserLoggedIn) {
      onNameNeeded?.();
      return;
    }
    if (e.key === 'Enter' && inputValue.trim() && !isSubmitting) {
      e.preventDefault();
      setIsSubmitting(true);
      await onTaskAdd(inputValue.trim());
      setInputValue('');
      setIsEditing(false);
      setIsSubmitting(false);
      setShowTimer(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(task?.task || '');
      setShowTimer(false);
    }
  };

  const handleBlur = async () => {
    if (!isUserLoggedIn) {
      return;
    }
    if (inputValue.trim() && !isSubmitting && inputValue !== task?.task) {
      setIsSubmitting(true);
      await onTaskAdd(inputValue.trim());
      setIsEditing(false);
      setIsSubmitting(false);
      setShowTimer(false);
    } else {
      setIsEditing(false);
      setInputValue(task?.task || '');
      setShowTimer(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.closest('button') ||
      target.closest('input')
    ) {
      return;
    }

    if (!isUserLoggedIn) {
      onNameNeeded?.();
      return;
    }

    setIsEditing(true);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUserLoggedIn) {
      onNameNeeded?.();
      return;
    }
    if (task) {
      onDelete?.(task.id);
    } else if (inputValue) {
      setInputValue('');
      setShowTimer(false);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUserLoggedIn) {
      onNameNeeded?.();
      return;
    }
    if (task) {
      onComplete(task.id);
    }
  };

  const showIcons = task || (isEditing && showTimer);

  return (
    <div
      ref={containerRef}
      className={`bg-white border ${task ? 'border-[#ffebc7]' : 'border-gray-200'} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-[80px] cursor-pointer group`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Always show grip container for consistent spacing */}
        <div className="flex items-center -ml-2">
          <div className="w-8 flex items-center justify-center">
            {task && (
              <GripVertical 
                size={16} 
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-move" 
              />
            )}
          </div>
        </div>
        <button
          onClick={handleComplete}
          className={`p-1 ${task ? 'text-[#f4a61d] hover:text-[#d88e0c]' : 'text-gray-300'} transition-colors flex-shrink-0`}
        >
          <Square size={24} />
        </button>
        <div className="flex-1 flex items-center min-h-[32px]">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              maxLength={100}
              className="w-full bg-transparent border-none outline-none placeholder-gray-400"
              autoFocus
            />
          ) : (
            <p className={`text-gray-800 ${!task ? 'text-gray-400' : ''} w-full cursor-text`}>
              {task ? task.task : placeholder}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showIcons && (
            <>
              <TaskTimer taskId={task?.id || 'new'} showOptions={true} />
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskLine;