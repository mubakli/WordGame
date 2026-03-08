'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MultipleChoice from '@/components/MultipleChoice';
import TextInputQuiz from '@/components/TextInputQuiz';
import { WordPair } from '@/data/vocabulary';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useDecks } from '@/hooks/useDecks';
import { useAuth } from '@/hooks/useAuth';
import { Database, BookOpen, Layers, PartyPopper, LogOut, User } from 'lucide-react';
import Link from 'next/link';

type QuizMode = 'multiple-choice' | 'text-input';

export default function Home() {
  const { user, logout } = useAuth();
  const { decks, isLoaded: decksLoaded } = useDecks();
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  // Fetch vocabulary only when a deck is active
  const { vocabulary, isLoaded: vocabLoaded } = useVocabulary(activeDeckId || undefined);
  
  // Learning Algorithm State
  const [activePool, setActivePool] = useState<WordPair[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Quiz State
  const [score, setScore] = useState({ correct: 0, attempts: 0 });
  const [currentMode, setCurrentMode] = useState<QuizMode>('multiple-choice');
  const [options, setOptions] = useState<string[]>([]);

  // Helper to generate 3 random wrong options + 1 correct option
  const generateOptions = useCallback((currentWord: WordPair, allWords: WordPair[]) => {
    const wrongOptions = allWords
      .filter(w => w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.turkish);
    
    // Combine and shuffle
    return [...wrongOptions, currentWord.turkish].sort(() => 0.5 - Math.random());
  }, []);

  // Setup the current question mode and options
  const setupQuestion = useCallback((word: WordPair, allWords: WordPair[]) => {
    if (!word || !allWords || allWords.length === 0) return;

    // Randomly pick multiple choice or text input (e.g., 50/50 chance)
    const mode = Math.random() > 0.5 ? 'multiple-choice' : 'text-input';
    setCurrentMode(mode);

    if (mode === 'multiple-choice') {
      setOptions(generateOptions(word, allWords));
    }
  }, [generateOptions]);

  // Initial client-side setup
  useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger setup whenever vocabulary finishes loading for the active deck
  useEffect(() => {
    if (vocabLoaded && activeDeckId && vocabulary.length > 0) {
      // Initialize pool with shuffled vocabulary
      const initialPool = [...vocabulary].sort(() => Math.random() - 0.5);
      setActivePool(initialPool);
      setScore({ correct: 0, attempts: 0 });
      setIsFinished(false);
      setupQuestion(initialPool[0], vocabulary);
    }
  }, [vocabLoaded, activeDeckId, vocabulary, setupQuestion]);

  const handleAnswer = (isCorrect: boolean) => {
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      attempts: prev.attempts + 1
    }));
    
    setTimeout(() => {
      setActivePool(prevPool => {
        if (prevPool.length === 0) return prevPool;
        
        const currentWord = prevPool[0];
        const nextPool = [...prevPool.slice(1)]; // Remove the current word from the front
        
        if (!isCorrect) {
          // If incorrect (or "I Don't Know"), push it to the back of the pool to repeat later
          nextPool.push(currentWord);
        }
        
        if (nextPool.length === 0) {
          setIsFinished(true);
        } else {
          // Setup the next question with the new first word
          setupQuestion(nextPool[0], vocabulary);
        }
        
        return nextPool;
      });
    }, isCorrect ? 400 : 1800); // Give user more time to digest the right answer if they got it wrong
  };

  const handleRestart = () => {
    if (!vocabulary || vocabulary.length === 0) return;
    const initialPool = [...vocabulary].sort(() => Math.random() - 0.5);
    setActivePool(initialPool);
    setScore({ correct: 0, attempts: 0 });
    setIsFinished(false);
    setupQuestion(initialPool[0], vocabulary);
  };

  if (!mounted || !decksLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  // Handle Scenario 1: User hasn't selected a Deck yet
  if (!activeDeckId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-gray-950 flex flex-col items-center justify-center p-6 sm:p-12 font-[family-name:var(--font-geist-sans)] transition-colors duration-500 relative">
        <div className="absolute top-8 w-full px-6 max-w-4xl flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white tracking-tight">
              LinguaQuiz
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-lg font-medium border border-gray-200 dark:border-gray-700 shadow-sm cursor-default">
                <User size={16} className="mr-2 opacity-70" /> {user.username}
              </div>
            )}
            <Link 
              href="/manage"
              className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-900/80 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-lg font-medium border border-gray-200 dark:border-gray-800 transition-colors shadow-sm"
            >
              <Database size={16} className="sm:mr-2" /> <span className="hidden sm:inline">Manage Decks</span>
            </Link>
            {user && (
               <button 
                 onClick={logout}
                 className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm rounded-lg font-medium border border-red-200 dark:border-red-500/20 transition-colors shadow-sm"
               >
                 <LogOut size={16} className="sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
               </button>
            )}
            {!user && (
               <Link 
                 href="/login"
                 className="inline-flex items-center px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-sm rounded-lg font-bold shadow-sm transition-all active:scale-95"
               >
                 Sign In
               </Link>
            )}
          </div>
        </div>

        <div className="w-full max-w-4xl mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Select a Deck to Study</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Choose a vocabulary group to begin your quiz session.</p>
          </div>

          {decks.length === 0 ? (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-10 rounded-3xl shadow-xl text-center max-w-lg mx-auto border border-gray-200 dark:border-gray-800">
              <Layers size={48} className="mx-auto text-gray-800 dark:text-gray-200 mb-6 opacity-80" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Decks Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                You haven't created any vocabulary decks yet. Head over to the management panel to create your first deck!
              </p>
              <Link
                href="/manage"
                className="inline-flex items-center justify-center px-6 py-3 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl font-medium shadow-md transition-all active:scale-95"
              >
                Go to Manage
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => setActiveDeckId(deck.id)}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:scale-105 hover:border-black dark:hover:border-white transition-all duration-300 text-left group"
                >
                  <BookOpen size={32} className="text-gray-800 dark:text-gray-200 mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 truncate">{deck.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    {deck._count?.words || 0} Words
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // Handle Scenario 2: Active Deck loading words
  if (!vocabLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 animate-pulse">Loading Vocabulary for Deck...</p>
      </div>
    );
  }

  // Handle Scenario 3: Active Deck has no words
  if (vocabulary.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-gray-950 flex flex-col items-center justify-center p-6 sm:p-12 font-[family-name:var(--font-geist-sans)] transition-colors duration-500 relative">
        
        {/* Header section */}
        <div className="absolute top-8 w-full px-6 max-w-4xl flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white tracking-tight cursor-pointer" onClick={() => setActiveDeckId(null)}>
              LinguaQuiz
            </h1>
          </div>
          <button 
            onClick={() => setActiveDeckId(null)}
            className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-900/80 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-lg font-medium border border-gray-200 dark:border-gray-800 transition-colors shadow-sm"
          >
            Switch Deck
          </button>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-10 rounded-3xl shadow-xl text-center max-w-lg border border-gray-200 dark:border-gray-800 mt-20">
          <Database size={48} className="mx-auto text-gray-800 dark:text-gray-200 mb-6 opacity-80" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Words Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            This vocabulary deck is empty. Add some english-turkish word pairs to start practicing!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/manage"
              className="inline-flex items-center justify-center px-6 py-3 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl font-medium shadow-md transition-all active:scale-95"
            >
              Add Words
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Handle Scenario 4: Finished the Deck
  if (isFinished) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-gray-950 flex flex-col items-center justify-center p-6 sm:p-12 font-[family-name:var(--font-geist-sans)] transition-colors duration-500 relative">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-10 rounded-3xl shadow-xl text-center max-w-lg border border-gray-200 dark:border-gray-800 mt-10">
          <PartyPopper size={64} className="mx-auto text-gray-800 dark:text-gray-200 mb-6 animate-bounce" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">Deck Completed!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            Outstanding! You successfully learned all <strong>{vocabulary.length}</strong> words.
          </p>
          
          <div className="bg-gray-50 dark:bg-black/50 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold mb-2">Total Attempts</div>
            <div className="text-4xl font-black text-gray-900 dark:text-gray-100">{score.attempts}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              (Lower is better!)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="inline-flex items-center justify-center px-6 py-3 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl font-medium shadow-md transition-all active:scale-95"
            >
              Study Again
            </button>
            <button
              onClick={() => setActiveDeckId(null)}
              className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-xl font-medium shadow-sm transition-all active:scale-95"
            >
              Switch Deck
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Normal Scenario: User is actively taking the quiz
  if (activePool.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 animate-pulse">Starting Quiz...</p>
      </div>
    );
  }

  const currentWord = activePool[0];
  const currentDeckName = decks.find(d => d.id === activeDeckId)?.name || "Unknown Deck";
  const wordsRemaining = activePool.length;
  const wordsLearned = vocabulary.length - wordsRemaining;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-gray-950 flex flex-col items-center justify-center p-6 sm:p-12 font-[family-name:var(--font-geist-sans)] transition-colors duration-500 relative">
      
      {/* Header section with Score and Admin Link */}
      <div className="absolute top-8 w-full px-6 max-w-4xl flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
        <div>
          <button onClick={() => setActiveDeckId(null)} className="text-left group cursor-pointer border-none bg-transparent p-0 m-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white tracking-tight group-hover:opacity-80 transition-opacity">
              LinguaQuiz
            </h1>
            <p className="mt-1 text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Studying: <span className="font-bold text-gray-900 dark:text-gray-100">{currentDeckName}</span></span>
            </p>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
              href="/manage"
              className="inline-flex items-center px-3 py-2 bg-white/80 dark:bg-gray-900/80 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-lg font-medium border border-gray-200 dark:border-gray-800 transition-colors shadow-sm"
            >
            <Database size={16} className="hidden sm:inline mr-2" /> Manage
          </Link>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider block mb-1">Learned</span>
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{wordsLearned} 
              <span className="text-base text-gray-400 dark:text-gray-500 ml-1 font-medium">/ {vocabulary.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 mt-20">
        
        {/* Progress Indicator */}
        <div className="w-full max-w-lg mb-4 flex justify-between items-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span>{wordsRemaining} Remaining in Pool</span>
        </div>

        {/* Quiz Component Container */}
        <div className="w-full flex justify-center mb-8 min-h-[400px] items-center">
          {currentMode === 'multiple-choice' ? (
            <MultipleChoice 
              wordPair={currentWord} 
              options={options} 
              onAnswer={handleAnswer} 
            />
          ) : (
            <TextInputQuiz 
              wordPair={currentWord} 
              onAnswer={handleAnswer} 
            />
          )}
        </div>
        
      </div>

    </main>
  );
}
