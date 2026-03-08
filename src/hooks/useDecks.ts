'use client';

import { useState, useEffect } from 'react';

export interface Deck {
  id: string;
  name: string;
  _count?: {
    words: number;
  };
}

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch decks from API
  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/decks');
      if (response.ok) {
        const data = await response.json();
        setDecks(data);
      } else {
        console.error('Failed to fetch decks');
      }
    } catch (err) {
      console.error('Error fetching decks:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const addDeck = async (name: string) => {
    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const newDeck = await response.json();
        setDecks((prev) => [...prev, newDeck]);
        return newDeck;
      }
      return null;
    } catch (err) {
      console.error('Error adding deck:', err);
      return null;
    }
  };

  const deleteDeck = async (id: string) => {
    try {
      const response = await fetch(`/api/decks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDecks((prev) => prev.filter((deck) => deck.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting deck:', err);
      return false;
    }
  };

  return {
    decks,
    isLoaded,
    addDeck,
    deleteDeck,
    refreshDecks: fetchDecks
  };
}
