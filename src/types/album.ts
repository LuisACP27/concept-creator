export interface AudioFile {
  name: string;
  size: number;
  type: 'audio/wav' | 'audio/mpeg';
  data: string; // Base64
}

export interface VideoFile {
  name: string;
  size: number;
  type: 'video/mp4' | 'video/webm' | 'video/ogg';
  data: string; // Base64
}

export interface Track {
  title: string;
  description?: string;
  audioSrc?: string; // Base64 Data URL (deprecated, kept for compatibility)
  audioFile?: AudioFile;
  videoFile?: VideoFile;
}

export interface Album {
  id: string;
  name: string;
  coverImage: string; // Base64 Data URL
  styleDescription?: string;
  concept?: string;
  targetAudience?: string;
  lyricalContent?: string;
  productionAndSound?: string;
  tracks?: Track[];
} 