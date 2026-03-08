'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Redirect to manage on success
        router.push('/manage');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-gray-950 flex flex-col items-center justify-center p-6 sm:p-12 font-[family-name:var(--font-geist-sans)] relative">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white tracking-tight hover:opacity-80 transition-opacity">
          LinguaQuiz
        </Link>
      </div>

      <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
            <LogIn size={32} className="text-gray-800 dark:text-gray-200" />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Sign in to manage your vocabulary decks.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-gray-500/50 shadow-sm transition-all"
              required
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-gray-500/50 shadow-sm transition-all"
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full mt-4 py-3.5 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <span className="animate-pulse">Signing in...</span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
          Don't have an account?{' '}
          <Link href="/register" className="text-black dark:text-white font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
