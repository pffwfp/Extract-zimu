import React from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { SubtitleItem } from '../types';
import { generateSRT, generateTXT, downloadFile } from '../services/utils';

interface ResultsViewProps {
  subtitles: SubtitleItem[];
}

export const ResultsView: React.FC<ResultsViewProps> = ({ subtitles }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = generateTXT(subtitles);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div>
            <h2 className="text-lg font-semibold text-white">Extraction Complete</h2>
            <p className="text-slate-400 text-sm">{subtitles.length} segments found</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
            >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Text'}
            </button>
            <button 
                onClick={() => downloadFile(generateSRT(subtitles), 'subtitles.srt', 'text/plain')}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
            >
                <Download className="w-4 h-4 text-blue-400" />
                Download .SRT
            </button>
            <button 
                onClick={() => downloadFile(generateTXT(subtitles), 'transcript.txt', 'text/plain')}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
            >
                <Download className="w-4 h-4 text-yellow-400" />
                Download .TXT
            </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-950/50 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-800">
                        <th className="p-4 w-32 font-medium">Time</th>
                        <th className="p-4 font-medium">Original (CN)</th>
                        <th className="p-4 font-medium">Translation (EN)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {subtitles.map((sub) => (
                        <tr key={sub.id} className="group hover:bg-slate-800/50 transition-colors">
                            <td className="p-4 text-slate-500 font-mono text-xs whitespace-nowrap align-top pt-5">
                                <div className="bg-slate-800 px-2 py-1 rounded inline-block border border-slate-700">
                                    {sub.startTime.split(',')[0]}
                                </div>
                            </td>
                            <td className="p-4 text-slate-200 align-top">
                                <p className="leading-relaxed">{sub.original}</p>
                            </td>
                            <td className="p-4 text-slate-300 align-top">
                                <p className="leading-relaxed text-pink-200/90">{sub.translation}</p>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};