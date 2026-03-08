'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WordPair } from '@/data/vocabulary';
import { ArrowRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface TextInputQuizProps {
  wordPair: WordPair;
  onAnswer: (isCorrect: boolean) => void;
}

type QuizState = 'typing' | 'correct' | 'wrong' | 'revealed';

const TextInputQuiz: React.FC<TextInputQuizProps> = ({ wordPair, onAnswer }) => {
  const [inputValue, setInputValue] = useState('');
  const [quizState, setQuizState] = useState<QuizState>('typing');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when a new word is provided
  useEffect(() => {
    setInputValue('');
    setQuizState('typing');
    // Auto focus the input field for better UX
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [wordPair]);

  // Keyboard Shortcuts for actions outside input or alternative overrides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow overriding "wrong" feedback with Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (quizState === 'wrong') {
          e.preventDefault();
          handleIKnewThis();
        }
      }

      // Allow hitting Escape to declare "Bilmiyorum" (Don't Know) while typing
      if (e.key === 'Escape' && quizState === 'typing') {
        e.preventDefault();
        handleDontKnow();
      }

      // Allow skipping entirely when an answer is revealed or wrong, without typing it
      if (e.shiftKey && e.key === 'Enter') {
        if (quizState === 'wrong' || quizState === 'revealed') {
          e.preventDefault();
          handleSkip();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizState]);

  const expectedAnswer = wordPair.turkish.trim().toLocaleLowerCase('tr-TR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const normalizedInput = inputValue.trim().toLocaleLowerCase('tr-TR');
    const isMatch = expectedAnswer.includes(normalizedInput);

    // If they were already wrong or revealed, they just need to type the correct answer to continue.
    if (quizState === 'wrong' || quizState === 'revealed') {
      if (isMatch || normalizedInput === expectedAnswer) {
        // They correctly typed it out. Advance the quiz but register as a fail (since they needed help).
        setQuizState('correct'); // Show green check briefly
        onAnswer(false);
      }
      return;
    }

    // Normal first-time answering flow
    if (isMatch) {
      setQuizState('correct');
      onAnswer(true);
    } else {
      setQuizState('wrong');
      setInputValue(''); // Clear input so they can try again or see the answer
      // Focus the input again so they can immediately start typing the right answer
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleDontKnow = () => {
    setQuizState('revealed');
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSkip = () => {
    // Advance to the next question, but mark this one as failed so it returns to the pool
    setQuizState('correct');
    onAnswer(false);
  };

  const handleIKnewThis = () => {
    // Override a wrong state and mark it correct
    setQuizState('correct');
    onAnswer(true);
  };

  const isLocked = quizState === 'correct';

  return (
    <div className="w-full max-w-lg flex flex-col items-center bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 transition-all duration-500">
      
      {/* Question Header */}
      <span className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-6">
        Type Translation
      </span>
      
      {/* English Word */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-10 text-center">
        {wordPair.english}
      </h2>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="w-full relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLocked}
          placeholder={
            quizState === 'typing' ? "Type the Turkish meaning..." : 
            quizState === 'wrong' ? "Try again, or type the correct answer below" :
            quizState === 'revealed' ? "Type the correct answer to continue" : ""
          }
          className={`w-full py-4 px-6 pr-14 rounded-xl border-2 text-lg font-medium bg-white/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 ${
            quizState === 'correct'
              ? 'border-green-500 ring-green-500/20'
              : quizState === 'wrong'
              ? 'border-red-500 ring-red-500/20'
              : quizState === 'revealed'
              ? 'border-orange-500 ring-orange-500/20'
              : 'border-white/20 dark:border-gray-600 focus:border-gray-500 focus:ring-gray-500/20'
          }`}
          autoComplete="off"
        />
        
        {/* Submit Button or Status Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {quizState === 'correct' ? (
            <CheckCircle className="text-green-500 pr-2" size={32} />
          ) : (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={`p-2 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                quizState === 'wrong' ? 'bg-red-500 hover:bg-red-600' : 
                quizState === 'revealed' ? 'bg-orange-500 hover:bg-orange-600' :
                'bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black'
              }`}
            >
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </form>

      {/* Error / Reveal Feedback */}
      {(quizState === 'wrong' || quizState === 'revealed') && (
        <div className="w-full mt-6 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Display Correct Answer */}
          <div className={`w-full p-4 rounded-xl border text-center ${
            quizState === 'wrong' ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'
          }`}>
            <p className={`text-sm font-medium mb-1 ${quizState === 'wrong' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
              Correct Answer:
            </p>
            <p className={`text-xl font-bold ${quizState === 'wrong' ? 'text-red-700 dark:text-red-300' : 'text-orange-700 dark:text-orange-300'}`}>
              {wordPair.turkish}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Type this answer exactly, or press <span className="font-bold">Shift + Enter</span> to skip.
            </p>
          </div>

          <div className="flex w-full gap-3">
            {/* I Knew This Button (Only if they guessed incorrectly) */}
            {quizState === 'wrong' && (
              <button
                onClick={handleIKnewThis}
                className="flex-1 px-4 py-3 flex items-center justify-between gap-2 rounded-xl text-sm font-semibold text-green-700 dark:text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 active:scale-95 transition-all"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw size={18} />
                  <span className="hidden sm:inline">Doğru Bilmiştim</span>
                  <span className="sm:hidden">Geç</span>
                </div>
                <span className="px-2 py-1 rounded bg-green-500/20 text-[10px] uppercase font-bold tracking-wider opacity-70">
                  ⌘/⌃ + ↵
                </span>
              </button>
            )}

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-3 flex items-center justify-between gap-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2">
                <ArrowRight size={18} />
                <span>Geç (Yazmadan)</span>
              </div>
              <span className="px-2 py-1 rounded bg-gray-500/20 text-[10px] uppercase font-bold tracking-wider opacity-70">
                ⇧ + ↵
              </span>
            </button>
          </div>

        </div>
      )}

      {/* Bilmiyorum Option */}
      {quizState === 'typing' && (
        <div className="w-full mt-6 flex justify-center">
          <button
            onClick={handleDontKnow}
            className="px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all"
          >
            <span>Bilmiyorum</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-red-500/20">Esc</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TextInputQuiz;
