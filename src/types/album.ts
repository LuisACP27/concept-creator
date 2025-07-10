export interface Track {
  title: string;
  description?: string;
  audioSrc?: string; // Base64 Data URL
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