import React, { useState } from 'react';

interface NameInputProps {
  onSubmit: (name: string) => Promise<void>;
  onClose: () => void;
  isOverlay?: boolean;
}

function NameInput({ onSubmit, onClose, isOverlay = false }: NameInputProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateName = (input: string): string | null => {
    if (!input.trim()) {
      return 'Please enter your name';
    }
    if (input.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (input.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    if (!/^[a-zA-Z0-9\s-']+$/.test(input.trim())) {
      return 'Name can only contain letters, numbers, spaces, hyphens, and apostrophes';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(name.trim());
      setName('');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save name. Please try again.';
      console.error('Name input error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError(''); // Clear error when user starts typing
  };

  return (
    <div 
      className={`${isOverlay ? 'fixed inset-0 bg-black/50 backdrop-blur-sm' : ''} flex items-center justify-center z-50`}
      onClick={isOverlay ? handleOverlayClick : undefined}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome!</h2>
        <p className="text-gray-600 mb-4">Please enter your name to continue:</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Your name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4a61d] focus:border-transparent transition-colors
                ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              disabled={isSubmitting}
              maxLength={50}
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? "name-error" : undefined}
            />
            
            {error && (
              <p 
                id="name-error" 
                className="text-red-500 text-sm mt-2 animate-fade-in"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#f4a61d] text-white py-2 px-4 rounded-lg transition-all
              ${isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#d88e0c] active:scale-[0.98]'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NameInput;