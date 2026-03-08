'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDecks, Deck } from '@/hooks/useDecks';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Plus, Trash2, Folder, BookOpen, LogOut, User } from 'lucide-react';

export default function ManageVocabulary() {
  const { user, logout } = useAuth();
  const { decks, isLoaded: decksLoaded, addDeck, deleteDeck } = useDecks();
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  
  // Fetch vocabulary only for the active deck
  const { vocabulary, isLoaded: vocabLoaded, addWord, deleteWord } = useVocabulary(activeDeckId || undefined);
  
  const [newDeckName, setNewDeckName] = useState('');
  const [englishInput, setEnglishInput] = useState('');
  const [turkishInput, setTurkishInput] = useState('');

  // Auto-select the first deck when decks load
  useEffect(() => {
    if (decksLoaded && decks.length > 0 && !activeDeckId) {
      setActiveDeckId(decks[0].id);
    }
  }, [decksLoaded, decks, activeDeckId]);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    
    const deck = await addDeck(newDeckName);
    if (deck) {
      setActiveDeckId(deck.id);
    }
    setNewDeckName('');
  };

  const handleDeleteDeck = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the deck "${name}"? All words inside will be permanently lost.`)) {
      await deleteDeck(id);
      if (activeDeckId === id) {
        setActiveDeckId(decks.length > 1 ? decks.find(d => d.id !== id)?.id || null : null);
      }
    }
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!englishInput.trim() || !turkishInput.trim() || !activeDeckId) return;

    addWord(englishInput, turkishInput, activeDeckId);
    setEnglishInput('');
    setTurkishInput('');
  };

  if (!decksLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  const activeDeckName = decks.find(d => d.id === activeDeckId)?.name;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-gray-950 p-6 sm:p-12 font-[family-name:var(--font-geist-sans)]">
      
      <div className="max-w-6xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-2 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Quiz
            </Link>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white tracking-tight">
              Manage Your Decks
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Organize your vocabulary into multiple study groups.
            </p>
          </div>
          <div className="flex items-center gap-3">
             {user && (
               <div className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-lg font-medium border border-gray-200 dark:border-gray-700 shadow-sm cursor-default">
                 <User size={16} className="mr-2 opacity-70" /> {user.username}
               </div>
             )}
             <button 
               onClick={logout}
               className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm rounded-lg font-medium border border-red-200 dark:border-red-500/20 transition-colors shadow-sm"
             >
               <LogOut size={16} className="sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
             </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Panel: Decks List */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            
            {/* Create Deck Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center uppercase tracking-wider">
                <Folder size={16} className="mr-2" /> New Deck
              </h2>
              <form onSubmit={handleCreateDeck} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Deck name (e.g. TOEFL)"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-gray-500/50"
                  required
                />
                <button
                  type="submit"
                  disabled={!newDeckName.trim()}
                  className="p-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </form>
            </div>

            {/* Decks List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex-1">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Your Decks
                </h2>
              </div>
              
              {decks.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  No decks yet. Create one above!
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {decks.map((deck) => (
                    <li key={deck.id} className={`group flex justify-between items-center px-5 py-3 cursor-pointer transition-colors ${activeDeckId === deck.id ? 'bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20 border-l-4 border-transparent'}`}
                        onClick={() => setActiveDeckId(deck.id)}>
                      <div className="flex flex-col">
                        <span className={`font-medium ${activeDeckId === deck.id ? 'text-black dark:text-white font-bold' : 'text-gray-900 dark:text-gray-100'}`}>
                          {deck.name}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5">
                          {deck._count?.words || 0} words
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck.id, deck.name); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Deck"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          {/* Right Panel: Words List for Active Deck */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            
            {!activeDeckId ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center text-gray-500">
                <BookOpen size={48} className="mb-4 opacity-50" />
                <p>Select a deck from the left pane to manage its vocabulary.</p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center uppercase tracking-wider">
                      <BookOpen size={16} className="mr-2" /> Words in {activeDeckName}
                    </h2>
                    <div className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                      {vocabulary.length} entries
                    </div>
                  </div>

                  {/* Add Word Form */}
                  <div className="p-5 border-b border-gray-100 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Add a new word</h3>
                    <form onSubmit={handleAddWord} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="English word..."
                        value={englishInput}
                        onChange={(e) => setEnglishInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-gray-500/50 shadow-sm"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Turkish meaning..."
                        value={turkishInput}
                        onChange={(e) => setTurkishInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-gray-500/50 shadow-sm"
                        required
                      />
                      <button
                        type="submit"
                        disabled={!englishInput.trim() || !turkishInput.trim()}
                        className="px-6 py-2.5 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-medium rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                      >
                        Add Word
                      </button>
                    </form>
                  </div>
                  
                  {!vocabLoaded ? (
                     <div className="p-12 text-center text-gray-500 animate-pulse">Loading words...</div>
                  ) : vocabulary.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      This deck is empty. Add some words above!
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-[500px] overflow-y-auto">
                      {vocabulary.map((word) => (
                        <li key={word.id} className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors group">
                          <div className="flex text-base">
                            <span className="font-bold text-gray-900 dark:text-gray-100 w-32 sm:w-48 truncate pr-4">{word.english}</span>
                            <span className="text-gray-600 dark:text-gray-400">{word.turkish}</span>
                          </div>
                          <button
                            onClick={() => deleteWord(word.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete word"
                          >
                            <Trash2 size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}
