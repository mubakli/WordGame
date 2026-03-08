'use client';

import { useState, useEffect } from 'react';
import { WordPair } from '@/data/vocabulary';

export function useVocabulary(deckId?: string) {
  const [vocabulary, setVocabulary] = useState<WordPair[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch words from API
  const fetchWords = async () => {
    if (!deckId) {
      setVocabulary([]);
      setIsLoaded(true);
      return;
    }
    
    setIsLoaded(false);
    try {
      // In a more complex app, we would make the GET endpoint accept a query param ?deckId=
      // For simplicity, we can fetch all and filter client side OR update the endpoint.
      // Let's assume we update the endpoint to /api/words?deckId=xyz
      const response = await fetch(`/api/words?deckId=${deckId}`);
      if (response.ok) {
        const data = await response.json();
        setVocabulary(data);
      } else {
        console.error('Failed to fetch words');
      }
    } catch (err) {
      console.error('Error fetching words:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [deckId]);

  // Expose function to add a new word
  const addWord = async (english: string, turkish: string, targetDeckId?: string) => {
    const finalDeckId = targetDeckId || deckId;
    if (!finalDeckId) return false;
    
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ english, turkish, deckId: finalDeckId }),
      });

      if (response.ok) {
        const newWord = await response.json();
        // Optimistically add to list if we are currently viewing this deck
        if (finalDeckId === deckId) {
          setVocabulary((prev) => [newWord, ...prev]);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding word:', err);
      return false;
    }
  };

  // Expose function to delete a word
  const deleteWord = async (id: string) => {
    try {
      const response = await fetch(`/api/words/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Optimistically remove from list
        setVocabulary((prev) => prev.filter((word) => word.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting word:', err);
      return false;
    }
  };

  // Reseeding mechanism will need a dedicated API route if needed
  // For now we'll just skip implementing generic reset on UI when using a real DB
  const resetToDefault = async () => {
    alert("Resetting to default is disabled in Database mode. Please delete/add manually.");
  };

  return {
    vocabulary,
    isLoaded,
    addWord,
    deleteWord,
    resetToDefault,
  };
}
