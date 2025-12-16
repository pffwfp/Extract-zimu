export interface SubtitleItem {
  id: number;
  startTime: string; // Format: HH:MM:SS,mmm
  endTime: string;   // Format: HH:MM:SS,mmm
  original: string;  // Chinese (usually)
  translation: string; // English
}

export enum ProcessingMode {
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  URL = 'URL'
}

export interface ProcessingStatus {
  isProcessing: boolean;
  step: 'idle' | 'uploading' | 'fetching' | 'analyzing' | 'complete' | 'error';
  message?: string;
}

export interface GeneratedSubtitleData {
  subtitles: SubtitleItem[];
}