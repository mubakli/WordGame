import React from 'react';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';

interface ControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onShuffle: () => void;
  currentIndex: number;
  totalWords: number;
}

const Controls: React.FC<ControlsProps> = ({ 
  onPrevious, 
  onNext, 
  onShuffle,
  currentIndex,
  totalWords
}) => {
  return (
    <div className="flex flex-col items-center gap-6 mt-12 w-full max-w-md">
      
      {/* Progress Indicator */}
      <div className="flex items-center gap-4 w-full px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        <span>{currentIndex + 1}</span>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / totalWords) * 100}%` }}
          />
        </div>
        <span>{totalWords}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between w-full">
        <button 
          onClick={onPrevious}
          className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === 0}
          aria-label="Previous Word"
        >
          <ChevronLeft size={24} />
        </button>

        <button 
          onClick={onShuffle}
          className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-all active:scale-95"
          aria-label="Shuffle Words"
        >
          <Shuffle size={20} />
        </button>

        <button 
          onClick={onNext}
          className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === totalWords - 1}
          aria-label="Next Word"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Controls;
