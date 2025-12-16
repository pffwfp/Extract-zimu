import React, { useState } from 'react';
import { Type, Sparkles } from 'lucide-react';

interface TextInputAreaProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({ onSubmit, disabled }) => {
  const [text, setText] = useState('');

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-medium">
            <Type className="w-5 h-5 text-pink-400" />
            <h3>Raw Subtitle/XML Input</h3>
        </div>
        <button
          onClick={() => onSubmit(text)}
          disabled={disabled || !text.trim()}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Process Text
        </button>
      </div>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste raw Bilibili CC JSON, XML Danmaku, or a messy transcript here..."
        className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none font-mono text-sm"
        rows={10}
        disabled={disabled}
      />
      
      <p className="mt-2 text-xs text-slate-500">
        Tip: You can open the Network tab in Bilibili, find the subtitle file (.json or .xml), and paste the content here.
      </p>
    </div>
  );
};