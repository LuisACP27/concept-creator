import type { Album } from "@/types/album";

export interface ExportData {
  version: string;
  exportDate: string;
  albums: Album[];
  metadata: {
    appName: string;
    totalAlbums: number;
    totalTracks: number;
  };
}

export class ExportImportService {
  private static readonly EXPORT_VERSION = "1.0.0";
  private static readonly APP_NAME = "Concept Creator";
  private static readonly FILE_EXTENSION = ".ccp"; // Concept Creator Project

  /**
   * Exports albums to a downloadable file
   */
  static exportAlbums(albums: Album[]): void {
    try {
      const totalTracks = albums.reduce((total, album) => 
        total + (album.tracks?.length || 0), 0);

      const exportData: ExportData = {
        version: this.EXPORT_VERSION,
        exportDate: new Date().toISOString(),
        albums,
        metadata: {
          appName: this.APP_NAME,
          totalAlbums: albums.length,
          totalTracks,
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `concept-creator-albums-${this.formatDateForFilename(new Date())}${this.FILE_EXTENSION}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting albums:", error);
      throw new Error("Failed to export albums");
    }
  }

  /**
   * Imports albums from a file
   */
  static async importAlbums(file: File): Promise<Album[]> {
    try {
      // Validate file extension
      if (!file.name.endsWith(this.FILE_EXTENSION)) {
        throw new Error("Invalid file format. Please select a .ccp file.");
      }

      // Read file content
      const content = await this.readFileAsText(file);
      
      // Parse JSON
      let exportData: ExportData;
      try {
        exportData = JSON.parse(content);
      } catch (parseError) {
        throw new Error("Invalid file format. Unable to parse file content.");
      }

      // Validate structure
      this.validateExportData(exportData);

      // Return albums with validated structure
      return this.sanitizeAlbums(exportData.albums);
    } catch (error) {
      console.error("Error importing albums:", error);
      throw error;
    }
  }

  /**
   * Validates the structure of imported data
   */
  private static validateExportData(data: any): asserts data is ExportData {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid file format.");
    }

    if (!data.version || !data.albums || !Array.isArray(data.albums)) {
      throw new Error("Invalid file structure.");
    }

    if (data.metadata?.appName !== this.APP_NAME) {
      throw new Error("File was not created by Concept Creator.");
    }

    // Validate each album
    data.albums.forEach((album: any, index: number) => {
      if (!album.id || !album.name || !album.coverImage) {
        throw new Error(`Invalid album data at index ${index}.`);
      }

      // Validate tracks if they exist
      if (album.tracks && Array.isArray(album.tracks)) {
        album.tracks.forEach((track: any, trackIndex: number) => {
          if (!track.title) {
            throw new Error(`Invalid track data at album ${index}, track ${trackIndex}.`);
          }
        });
      }
    });
  }

  /**
   * Sanitizes and ensures album data integrity
   */
  private static sanitizeAlbums(albums: Album[]): Album[] {
    return albums.map(album => ({
      id: this.sanitizeString(album.id) || crypto.randomUUID(),
      name: this.sanitizeString(album.name) || "Untitled Album",
      coverImage: album.coverImage || "",
      styleDescription: this.sanitizeString(album.styleDescription),
      concept: this.sanitizeString(album.concept),
      targetAudience: this.sanitizeString(album.targetAudience),
      lyricalContent: this.sanitizeString(album.lyricalContent),
      productionAndSound: this.sanitizeString(album.productionAndSound),
      tracks: album.tracks?.map(track => ({
        title: this.sanitizeString(track.title) || "Untitled Track",
        description: this.sanitizeString(track.description),
        audioSrc: track.audioSrc, // Keep for backward compatibility
        audioFile: track.audioFile ? {
          name: this.sanitizeString(track.audioFile.name) || "audio",
          size: Math.max(0, Number(track.audioFile.size) || 0),
          type: this.validateAudioType(track.audioFile.type),
          data: track.audioFile.data || "",
        } : undefined,
      })) || [],
    }));
  }

  /**
   * Validates and sanitizes audio file type
   */
  private static validateAudioType(type: any): 'audio/wav' | 'audio/mpeg' {
    const validTypes = ['audio/wav', 'audio/mpeg'];
    return validTypes.includes(type) ? type : 'audio/mpeg';
  }

  /**
   * Sanitizes string input
   */
  private static sanitizeString(str: any): string | undefined {
    if (typeof str !== "string") return undefined;
    return str.trim() || undefined;
  }

  /**
   * Reads file content as text
   */
  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  /**
   * Formats date for filename
   */
  private static formatDateForFilename(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  /**
   * Merges imported albums with existing ones, handling duplicates
   */
  static mergeAlbums(existingAlbums: Album[], importedAlbums: Album[]): Album[] {
    const mergedAlbums = [...existingAlbums];
    
    importedAlbums.forEach(importedAlbum => {
      // Check if album with same ID already exists
      const existingIndex = mergedAlbums.findIndex(album => album.id === importedAlbum.id);
      
      if (existingIndex !== -1) {
        // If album exists, create a new one with different ID
        const newAlbum = {
          ...importedAlbum,
          id: crypto.randomUUID(),
          name: `${importedAlbum.name} (Imported)`,
        };
        mergedAlbums.push(newAlbum);
      } else {
        // If album doesn't exist, add it directly
        mergedAlbums.push(importedAlbum);
      }
    });

    return mergedAlbums;
  }

  /**
   * Estimates file size of albums data
   */
  static estimateDataSize(albums: Album[]): number {
    const jsonString = JSON.stringify(albums);
    return new Blob([jsonString]).size;
  }

  /**
   * Formats bytes to human readable string
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
