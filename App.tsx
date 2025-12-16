import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { TextInputArea } from './components/TextInputArea';
import { UrlInputArea } from './components/UrlInputArea';
import { ResultsView } from './components/ResultsView';
import { ProcessingStatus, SubtitleItem, ProcessingMode } from './types';
import { processVideoWithGemini, processRawTextWithGemini } from './services/geminiService';
import { fetchBilibiliSubtitles } from './services/bilibiliService';
import { fileToBase64 } from './services/utils';
import { Loader2, AlertCircle, Video, Type, Link } from 'lucide-react';

const App: React.FC = () => {
  const [subtitles, setSubtitles] = useState<SubtitleItem[] | null>(null);
  const [activeTab, setActiveTab] = useState<ProcessingMode>(ProcessingMode.URL);
  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    step: 'idle',
  });

  const handleFileSelect = useCallback(async (file: File) => {
    setStatus({ isProcessing: true, step: 'uploading', message: 'Reading file...' });
    setSubtitles(null);

    try {
      const base64 = await fileToBase64(file);
      
      setStatus({ isProcessing: true, step: 'analyzing', message: 'Gemini is listening and translating...' });
      
      const results = await processVideoWithGemini(base64, file.type, (msg) => {
        setStatus(prev => ({ ...prev, message: msg }));
      });

      setSubtitles(results);
      setStatus({ isProcessing: false, step: 'complete' });

    } catch (error: any) {
      console.error(error);
      setStatus({ 
        isProcessing: false, 
        step: 'error', 
        message: error.message || "Failed to process video. It might be too large or the format is unsupported."
      });
    }
  }, []);

  const handleTextSubmit = useCallback(async (text: string) => {
    setStatus({ isProcessing: true, step: 'analyzing', message: 'Parsing and translating text...' });
    setSubtitles(null);

    try {
      const results = await processRawTextWithGemini(text, (msg) => {
        setStatus(prev => ({ ...prev, message: msg }));
      });

      setSubtitles(results);
      setStatus({ isProcessing: false, step: 'complete' });
    } catch (error: any) {
      console.error(error);
       setStatus({ 
        isProcessing: false, 
        step: 'error', 
        message: error.message || "Failed to parse text."
      });
    }
  }, []);

  const handleUrlSubmit = useCallback(async (url: string) => {
    setStatus({ isProcessing: true, step: 'fetching', message: 'Fetching video metadata...' });
    setSubtitles(null);

    try {
      // 1. Fetch raw subtitle content
      const rawSubData = await fetchBilibiliSubtitles(url, (msg) => {
        setStatus(prev => ({ ...prev, message: msg }));
      });

      // 2. Process with Gemini
      setStatus({ isProcessing: true, step: 'analyzing', message: 'Gemini is translating and formatting subtitles...' });
      const results = await processRawTextWithGemini(rawSubData, (msg) => {
        setStatus(prev => ({ ...prev, message: msg }));
      });

      setSubtitles(results);
      setStatus({ isProcessing: false, step: 'complete' });

    } catch (error: any) {
      console.error(error);
      setStatus({ 
        isProcessing: false, 
        step: 'error', 
        message: error.message || "Failed to retrieve subtitles from URL."
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Intro */}
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Extract <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Bilibili Subtitles</span> Instantly
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Paste a Bilibili link to extract CC subtitles, or upload a video file for AI transcription.
                Powered by Gemini 2.5 Flash for accurate translation.
            </p>
        </div>

        {/* Tab Switcher */}
        {!subtitles && !status.isProcessing && (
          <div className="flex justify-center mb-8">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex flex-wrap justify-center gap-1">
              <button
                onClick={() => setActiveTab(ProcessingMode.URL)}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${activeTab === ProcessingMode.URL
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }
                `}
              >
                <Link className="w-4 h-4" />
                Paste URL
              </button>
              <button
                onClick={() => setActiveTab(ProcessingMode.VIDEO)}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${activeTab === ProcessingMode.VIDEO 
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }
                `}
              >
                <Video className="w-4 h-4" />
                Upload Media
              </button>
              <button
                onClick={() => setActiveTab(ProcessingMode.TEXT)}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${activeTab === ProcessingMode.TEXT 
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }
                `}
              >
                <Type className="w-4 h-4" />
                Paste Raw Data
              </button>
            </div>
          </div>
        )}

        {/* Input Areas */}
        {!subtitles && !status.isProcessing && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
             {activeTab === ProcessingMode.URL && (
              <UrlInputArea onSubmit={handleUrlSubmit} disabled={status.isProcessing} />
            )}
            {activeTab === ProcessingMode.VIDEO && (
              <UploadArea onFileSelect={handleFileSelect} disabled={status.isProcessing} />
            )}
            {activeTab === ProcessingMode.TEXT && (
              <TextInputArea onSubmit={handleTextSubmit} disabled={status.isProcessing} />
            )}
          </div>
        )}

        {/* Loading State */}
        {status.isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-pink-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-pink-500 animate-pulse" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">
                    {status.step === 'uploading' ? 'Processing File...' : 
                     status.step === 'fetching' ? 'Fetching from Bilibili...' : 
                     'AI Analysis in Progress'}
                </h3>
                <p className="text-slate-400">{status.message}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status.step === 'error' && (
          <div className="mt-8 bg-red-500/10 border border-red-500/50 rounded-xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div className="space-y-2">
                <h3 className="font-semibold text-red-400">Processing Failed</h3>
                <p className="text-red-300/80 text-sm">{status.message}</p>
                <button 
                  onClick={() => setStatus({ isProcessing: false, step: 'idle' })}
                  className="text-sm text-red-400 hover:text-red-300 underline underline-offset-4 mt-2"
                >
                  Try Again
                </button>
            </div>
          </div>
        )}

        {/* Results */}
        {subtitles && (
          <div className="space-y-6">
            <button
               onClick={() => {
                 setSubtitles(null);
                 setStatus({ isProcessing: false, step: 'idle' });
               }}
               className="text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors mb-4"
            >
              ← Process another video
            </button>
            <ResultsView subtitles={subtitles} />
          </div>
        )}

        {/* Instructions / Footer Help */}
        {!subtitles && !status.isProcessing && (
             <div className="mt-16 border-t border-slate-800 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-400 text-sm">
                <div>
                    <h4 className="text-slate-200 font-medium mb-2">How to use (URL Mode)</h4>
                    <ol className="list-decimal list-inside space-y-2 marker:text-pink-500">
                        <li>Find a Bilibili video with CC subtitles.</li>
                        <li>Copy the URL (e.g. https://www.bilibili.com/video/BV...).</li>
                        <li>Paste it above. We will fetch and translate the subtitles automatically.</li>
                    </ol>
                </div>
                <div>
                    <h4 className="text-slate-200 font-medium mb-2">How to use (Upload/Raw Mode)</h4>
                    <ul className="list-disc list-inside space-y-2 marker:text-pink-500">
                        <li>Use <strong>Upload Media</strong> if you want AI to transcribe audio from scratch.</li>
                        <li>Use <strong>Paste Raw Data</strong> if you have the JSON/XML content manually copied from DevTools.</li>
                    </ul>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;