import React from 'react';
import { ScissorsIcon } from './icons/ScissorsIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 dark:bg-black/20 p-2 rounded-full shadow-inner transition-colors duration-300">
            <ScissorsIcon className="text-brand-blue" />
        </div>
        <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                YouTube Clipper
            </h1>
            <p className="mt-1 text-md text-gray-600 dark:text-gray-400 hidden sm:block transition-colors duration-300">
                Create and share clips instantly.
            </p>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-brand-blue transition-all duration-300"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <MoonIcon className="w-6 h-6" />
        ) : (
          <SunIcon className="w-6 h-6" />
        )}
      </button>
    </header>
  );
};