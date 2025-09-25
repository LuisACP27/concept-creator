"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Music, Image } from "lucide-react";
import { ExportImportService } from "@/lib/export-import";
import type { Album } from "@/types/album";

export default function ImportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [albums, setAlbums] = useLocalStorage<Album[]>("albums", []);
  const [dragActive, setDragActive] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<{
    albums: Album[];
    metadata: any;
  } | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsImporting(true);
    setPreviewData(null);

    try {
      const importedAlbums = await ExportImportService.importAlbums(file);
      
      if (importedAlbums.length === 0) {
        toast({
          variant: "destructive",
          title: t('message.error'),
          description: "No valid albums found in the file.",
          action: <AlertCircle className="text-destructive" />,
        });
        return;
      }

      // Show preview
      setPreviewData({
        albums: importedAlbums,
        metadata: {
          totalAlbums: importedAlbums.length,
          totalTracks: importedAlbums.reduce((total, album) => total + (album.tracks?.length || 0), 0),
          estimatedSize: ExportImportService.formatBytes(ExportImportService.estimateDataSize(importedAlbums)),
        }
      });

    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: error instanceof Error ? error.message : t('import.error'),
        action: <AlertCircle className="text-destructive" />,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = () => {
    if (!previewData) return;

    try {
      // Merge with existing albums
      const mergedAlbums = ExportImportService.mergeAlbums(albums, previewData.albums);
      setAlbums(mergedAlbums);

      toast({
        title: t('message.success'),
        description: t('import.success') + ` (${previewData.albums.length} albums)`,
        action: <CheckCircle className="text-green-500" />,
      });

      // Navigate back to home
      router.push('/');
    } catch (error) {
      console.error("Confirm import error:", error);
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: "Failed to import albums. Please try again.",
        action: <AlertCircle className="text-destructive" />,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fadeInUp">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="btn-glow"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('nav.back')}
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-shimmer">
            {t('import.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('import.description')}
          </p>
        </div>
      </div>

      {!previewData ? (
        /* Upload Section */
        <Card className="card-glow glass-card animate-scale-in">
          <CardContent className="p-8">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-4">
                <div className={`p-4 rounded-full inline-block transition-all duration-300 ${
                  dragActive ? 'bg-primary/20 scale-110' : 'bg-primary/10'
                }`}>
                  <Upload className={`w-8 h-8 transition-colors duration-300 ${
                    dragActive ? 'text-primary' : 'text-primary/70'
                  }`} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {dragActive ? 'Drop your file here' : 'Upload Export File'}
                  </h3>
                  <p className="text-muted-foreground">
                    Drag and drop a .ccp file or click to browse
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    disabled={isImporting}
                    className="btn-glow gradient-primary text-primary-foreground border-0"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isImporting ? 'Processing...' : t('import.selectFile')}
                  </Button>
                  
                  <input
                    id="file-input"
                    type="file"
                    accept=".ccp,application/json"
                    onChange={handleFileChange}
                    disabled={isImporting}
                    className="hidden"
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Supported formats: .ccp (Concept Creator Project)</p>
                  <p>Maximum file size: 100MB</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Preview Section */
        <div className="space-y-6 animate-fadeInUp">
          {/* Preview Summary */}
          <Card className="card-glow glass-card">
            <CardHeader>
              <CardTitle className="text-xl text-glow">Import Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {previewData.metadata.totalAlbums}
                  </div>
                  <div className="text-sm text-muted-foreground">Albums</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {previewData.metadata.totalTracks}
                  </div>
                  <div className="text-sm text-muted-foreground">Tracks</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {previewData.metadata.estimatedSize}
                  </div>
                  <div className="text-sm text-muted-foreground">Size</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Albums Preview */}
          <Card className="card-glow glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Albums to Import</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {previewData.albums.map((album, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-card/50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                      {album.coverImage ? (
                        <img 
                          src={album.coverImage} 
                          alt={album.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Image className="w-6 h-6 text-primary/70" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{album.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Music className="w-3 h-3" />
                        <span>{album.tracks?.length || 0} tracks</span>
                        {album.tracks?.some(track => track.audioFile) && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">With audio</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setPreviewData(null)}
              className="btn-glow"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmImport}
              className="btn-glow gradient-primary text-primary-foreground border-0"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Import
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
