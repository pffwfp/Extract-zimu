import { SubtitleItem } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateSRT = (subtitles: SubtitleItem[]): string => {
  return subtitles
    .map((sub, index) => {
      return `${index + 1}\n${sub.startTime} --> ${sub.endTime}\n${sub.original}\n${sub.translation}\n`;
    })
    .join('\n');
};

export const generateTXT = (subtitles: SubtitleItem[]): string => {
  return subtitles
    .map((sub) => {
      return `[${sub.startTime}] ${sub.original} | ${sub.translation}`;
    })
    .join('\n');
};

export const formatDuration = (seconds: number): string => {
  const date = new Date(0);
  date.setSeconds(seconds);
  const timeString = date.toISOString().substr(11, 8);
  return timeString;
};

// Simple download trigger
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
