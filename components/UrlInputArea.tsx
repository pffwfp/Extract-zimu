import React, { useState } from 'react';
import { Link, Search } from 'lucide-react';

interface UrlInputAreaProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}

export const UrlInputArea: React.FC<UrlInputAreaProps> = ({ onSubmit, disabled }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
      <div className="bg-pink-500/10 p-4 rounded-full mb-6">
        <Link className="w-8 h-8 text-pink-500" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        Paste Bilibili Video URL
      </h3>
      <p className="text-slate-400 max-w-md mb-8">
        We will attempt to fetch existing CC subtitles from the video link and translate them.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-lg relative">
        <div className="relative flex items-center">
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.bilibili.com/video/BV..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-32 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                disabled={disabled}
            />
            <button
                type="submit"
                disabled={disabled || !url.trim()}
                className="absolute right-1 top-1 bottom-1 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:hover:bg-pink-600 text-white px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
                <Search className="w-4 h-4" />
                Extract
            </button>
        </div>
      </form>
      
      <div className="mt-6 flex flex-col gap-2 text-xs text-slate-500">
        <p>Supported format: https://www.bilibili.com/video/BV...</p>
        <p className="opacity-70">Note: Only works for videos that already have CC subtitles.</p>
      </div>
    </div>
  );
};