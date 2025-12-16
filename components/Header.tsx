import React from 'react';
import { Tv, Github } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-pink-500 p-2 rounded-lg shadow-lg shadow-pink-500/20">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">BiliSub AI</h1>
            <p className="text-xs text-slate-400">Subtitle Extractor & Translator</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <div className="hidden md:block text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                Powered by Gemini 2.5 Flash
            </div>
        </div>
      </div>
    </header>
  );
};