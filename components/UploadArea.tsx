import React, { useRef, useState } from 'react';
import { Upload, FileVideo, FileAudio, FileType } from 'lucide-react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndPass(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(e.target.files[0]);
    }
  };

  const validateAndPass = (file: File) => {
    // Basic validation
    const validTypes = ['video/', 'audio/'];
    if (validTypes.some(type => file.type.startsWith(type))) {
        onFileSelect(file);
    } else {
        alert("Please upload a valid Video or Audio file.");
    }
  };

  return (
    <div
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group
        ${isDragging 
          ? 'border-pink-500 bg-pink-500/10 scale-[1.01]' 
          : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-pink-500/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="video/*,audio/*"
        className="hidden"
        disabled={disabled}
      />
      
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className={`
          p-4 rounded-full transition-colors duration-300
          ${isDragging ? 'bg-pink-500 text-white' : 'bg-slate-700 group-hover:bg-slate-600 text-slate-300'}
        `}>
          <Upload className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {isDragging ? 'Drop video here' : 'Upload Bilibili Video/Audio'}
          </h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            Drag & drop or click to browse. Supports MP4, MP3, WEBM, WAV.
          </p>
          <p className="text-xs text-slate-500 pt-2">
            Max recommended size: 50MB (Extract audio for larger videos)
          </p>
        </div>

        <div className="flex gap-4 pt-4">
            <div className="flex items-center text-xs text-slate-500 gap-1">
                <FileVideo className="w-4 h-4" /> MP4/WebM
            </div>
            <div className="flex items-center text-xs text-slate-500 gap-1">
                <FileAudio className="w-4 h-4" /> MP3/WAV
            </div>
        </div>
      </div>
    </div>
  );
};