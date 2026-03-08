'use client';

import React, { useState, useEffect } from 'react';
import { WordPair } from '@/data/vocabulary';

interface MultipleChoiceProps {
  wordPair: WordPair;
  options: string[]; // 4 Turkish translations
  onAnswer: (isCorrect: boolean) => void;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ wordPair, options, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Reset state when a new word is provided
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswering(false);
  }, [wordPair]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswering) return;

      // Map 1, 2, 3, 4 to options array
      if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        if (options[index]) {
          handleOptionClick(options[index]);
        }
      }

      // Map Enter to 'Bilmiyorum'
      if (e.key === 'Enter') {
        setIsAnswering(true);
        onAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswering, options, onAnswer, wordPair]);

  const handleOptionClick = (option: string) => {
    if (isAnswering) return; // Prevent multiple clicks

    setSelectedAnswer(option);
    setIsAnswering(true);

    const isCorrect = option === wordPair.turkish;
    onAnswer(isCorrect);
  };

  const getOptionStyles = (option: string) => {
    if (!isAnswering) return 'bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 border-white/20 dark:border-gray-600 text-gray-800 dark:text-gray-200';
    
    // If answering, ALWAYS show correct answer in green (even if user selected wrong)
    if (option === wordPair.turkish) {
      return 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300';
    }
    
    // If the user selected this wrong option, show it in red
    if (option === selectedAnswer && option !== wordPair.turkish) {
      return 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300';
    }

    // Other options get faded out
    return 'bg-white/5 dark:bg-gray-800/20 border-white/5 dark:border-gray-700/50 text-gray-400 dark:text-gray-600 opacity-50';
  };

  return (
    <div className="w-full max-w-lg flex flex-col items-center bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 transition-all duration-500">
      
      {/* Question Header */}
      <span className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-6">
        Choose Translation
      </span>
      
      {/* English Word */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-10 text-center">
        {wordPair.english}
      </h2>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-4 w-full">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={isAnswering}
            className={`w-full py-4 px-6 rounded-xl border-2 text-left text-lg font-medium transition-all duration-300 transform flex items-center gap-3 ${
              !isAnswering ? 'active:scale-[0.98]' : ''
            } ${getOptionStyles(option)}`}
          >
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-black/10 dark:bg-white/10 text-sm font-bold opacity-70">
              {index + 1}
            </span>
            <span className="flex-1">{option}</span>
          </button>
        ))}
      </div>

      {/* Bilmiyorum Option */}
      {!isAnswering && (
        <div className="w-full mt-6 flex justify-center">
          <button
            onClick={() => {
              setIsAnswering(true);
              onAnswer(false);
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all"
          >
            <span>Bilmiyorum</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-red-500/20">Enter ↵</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MultipleChoice;
