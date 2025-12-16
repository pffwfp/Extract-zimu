import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SubtitleItem } from "../types";

// Schema for the structured output we want from Gemini
const subtitleSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      startTime: { type: Type.STRING, description: "Start time in HH:MM:SS,mmm format (e.g. 00:00:01,500)" },
      endTime: { type: Type.STRING, description: "End time in HH:MM:SS,mmm format (e.g. 00:00:04,000)" },
      original: { type: Type.STRING, description: "The original transcription of the audio (Chinese)" },
      translation: { type: Type.STRING, description: "The English translation of the segment" },
    },
    required: ["startTime", "endTime", "original", "translation"],
  },
};

export const processVideoWithGemini = async (
  base64Data: string,
  mimeType: string,
  onProgress: (msg: string) => void
): Promise<SubtitleItem[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure the environment is configured correctly.");
  }

  const ai = new GoogleGenAI({ apiKey });

  onProgress("Sending video data to Gemini 2.5 Flash...");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `
            You are a professional subtitle extractor and translator for Bilibili videos.
            
            Task:
            1. Transcribe the audio from the provided video/audio file accurately (mostly Chinese).
            2. Translate each segment into natural, high-quality English.
            3. Provide precise timestamps for each segment.
            4. If there is no speech, do not generate a segment.
            5. Ensure the Chinese transcription captures specific terminology correctly.

            Output strictly as a JSON array adhering to the schema.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: subtitleSchema,
        temperature: 0.2, // Low temperature for factual accuracy
      },
    });

    onProgress("Parsing response...");
    
    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const rawData = JSON.parse(text);
    
    // Add IDs to the items
    const processedData: SubtitleItem[] = rawData.map((item: any, index: number) => ({
      id: index + 1,
      startTime: item.startTime || "00:00:00,000",
      endTime: item.endTime || "00:00:00,000",
      original: item.original || "",
      translation: item.translation || "",
    }));

    return processedData;

  } catch (error) {
    console.error("Gemini Video Error:", error);
    throw error;
  }
};

export const processRawTextWithGemini = async (
  rawText: string,
  onProgress: (msg: string) => void
): Promise<SubtitleItem[]> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing.");
    }
  
    const ai = new GoogleGenAI({ apiKey });
  
    onProgress("Analyzing subtitle text...");
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              text: `
              You are a subtitle processing engine. 
              The user has provided raw text data from Bilibili. 
              This could be a JSON file (standard Bilibili CC structure with 'body' array), an XML Danmaku file, or a messy transcript.
              
              Raw Data:
              \`\`\`
              ${rawText.slice(0, 1000000)} 
              \`\`\`
              (Input truncated to first 1M chars)

              Task:
              1. Parse this data to extract dialogue lines and timestamps.
                 - If it is Bilibili JSON, look for 'body' array containing objects with 'from', 'to', and 'content' fields. 'from' is in seconds. Convert to HH:MM:SS,mmm.
                 - If it is XML, look for 'd' attributes (timestamp) and text content.
              2. Translate the extracted Chinese text to English.
              3. If existing English subtitles are present in the JSON, use them as reference but ensure they are natural.
              4. Remove any non-dialogue metadata or technical noise.
              
              Output strictly as a JSON array adhering to the schema.
              `,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: subtitleSchema,
        },
      });
  
      const text = response.text;
      if (!text) throw new Error("Empty response");
      
      const rawData = JSON.parse(text);
      
      const processedData: SubtitleItem[] = rawData.map((item: any, index: number) => ({
        id: index + 1,
        startTime: item.startTime,
        endTime: item.endTime,
        original: item.original,
        translation: item.translation,
      }));
  
      return processedData;
    } catch (error) {
        console.error("Gemini Text Error:", error);
        throw error;
    }
};