import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { useBreakouts } from '../hooks/useBreakouts';

const Toggle: React.FC = () => {
  const { joiningBreakout, toggleBreakoutStatus, loading } = useBreakouts();

  const toggleText = joiningBreakout 
    ? "Joining Breakout Rooms today"
    : "Opting-out of Breakout Rooms today";

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) {
      await toggleBreakoutStatus();
    }
  };

  return (
    <div 
      className="isolate w-full mb-4 relative z-50"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-end gap-2">
        <span className="text-gray-700 select-none">{toggleText}</span>
        <button
          onClick={handleClick}
          className={`relative p-2 rounded-md transition-all duration-200 ${
            loading ? 'opacity-50 cursor-wait' : 'hover:opacity-80 active:scale-95 cursor-pointer'
          }`}
          disabled={loading}
          aria-pressed={joiningBreakout}
          role="switch"
          style={{ 
            color: 'black',
            stroke: 'black',
            strokeWidth: '2px',
          }}
        >
          <div className="relative">
            {joiningBreakout ? (
              <ToggleRight 
                size={28} 
                style={{
                  ['--toggle-fill' as string]: '#f4a61d'
                }}
                className="transition-transform duration-200 [&_rect]:fill-[var(--toggle-fill)] [&_circle]:fill-[var(--toggle-fill)]"
              />
            ) : (
              <ToggleLeft 
                size={28} 
                style={{ fill: 'none' }}
                className="transition-transform duration-200"
              />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default Toggle;