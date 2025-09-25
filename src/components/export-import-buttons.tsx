"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { Download, Upload, FileText, CheckCircle, AlertCircle, Info } from "lucide-react";
import { ExportImportService } from "@/lib/export-import";
import { StorageCleaner } from "@/lib/clear-storage";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Album } from "@/types/album";

interface ExportImportButtonsProps {
  albums: Album[];
  onImportAlbums: (albums: Album[]) => void;
}

export function ExportImportButtons({ albums, onImportAlbums }: ExportImportButtonsProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleExport = async () => {
    if (albums.length === 0) {
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: "No albums to export.",
        action: <AlertCircle className="text-destructive" />,
      });
      return;
    }

    setIsExporting(true);
    try {
      ExportImportService.exportAlbums(albums);
      
      toast({
        title: t('message.success'),
        description: `${albums.length} album(s) exported successfully!`,
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: "Failed to export albums. Please try again.",
        action: <AlertCircle className="text-destructive" />,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setIsImporting(true);
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

      // Merge with existing albums
      const mergedAlbums = ExportImportService.mergeAlbums(albums, importedAlbums);
      onImportAlbums(mergedAlbums);

      toast({
        title: t('message.success'),
        description: t('import.success') + ` (${importedAlbums.length} albums)`,
        action: <CheckCircle className="text-green-500" />,
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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const estimatedSize = ExportImportService.estimateDataSize(albums);
  const formattedSize = ExportImportService.formatBytes(estimatedSize);
  const storageInfo = StorageCleaner.getStorageInfo();

  const handleClearStorage = () => {
    setShowClearDialog(true);
  };

  const handleConfirmClear = () => {
    StorageCleaner.clearAllData();
  };

  return (
    <div className="space-y-4">
      {/* Export Section */}
      <Card className="card-glow glass-card animate-scale-in">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="p-2 bg-blue-500/10 rounded-full flex-shrink-0">
                <Download className="w-5 h-5 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm">{t('export.title')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('export.description')}
                </p>
                {albums.length > 0 && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <span>{albums.length} albums</span>
                    <span>•</span>
                    <span>~{formattedSize}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting || albums.length === 0}
              size="sm"
              className="btn-glow gradient-primary text-primary-foreground border-0 flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : t('export.button')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card className="card-glow glass-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="p-2 bg-green-500/10 rounded-full flex-shrink-0">
                <Upload className="w-5 h-5 text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm">{t('import.title')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('import.description')}
                </p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <Info className="w-3 h-3" />
                  <span>Accepts .ccp files only</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleImportClick}
              disabled={isImporting}
              size="sm"
              variant="outline"
              className="btn-glow flex-shrink-0"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'Importing...' : t('import.button')}
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".ccp,application/json"
            onChange={handleFileChange}
            disabled={isImporting}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Clear Storage Section */}
      <Card className="border-destructive/20 animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="p-2 bg-destructive/10 rounded-full flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm text-destructive">Clear All Data</h3>
                <p className="text-xs text-muted-foreground">
                  {storageInfo.usedMB} used
                </p>
              </div>
            </div>
            <Button
              onClick={handleClearStorage}
              variant="destructive"
              size="sm"
              className="btn-glow flex-shrink-0"
            >
              Clear Storage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      {albums.length === 0 && (
        <Card className="border-dashed border-muted-foreground/20 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 text-center">
              <div className="p-2 bg-muted rounded-full flex-shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Create some albums first to enable export functionality.</p>
                <p className="text-xs mt-1">You can still import albums from other exports.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleConfirmClear}
        title="Clear All Data"
        message="This will delete ALL your albums and data."
        details={`Current storage: ${storageInfo.usedMB}\nAlbums: ${albums.length}`}
        confirmText="Clear Storage"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
