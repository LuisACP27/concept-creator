"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { Video, Upload, X, CheckCircle } from "lucide-react";
import type { VideoFile } from "@/types/album";

interface VideoUploadProps {
  videoFile?: VideoFile;
  onVideoChange: (videoFile: VideoFile | undefined) => void;
  disabled?: boolean;
}

export function VideoUpload({ videoFile, onVideoChange, disabled }: VideoUploadProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const RECOMMENDED_SIZE = 10 * 1024 * 1024; // 10MB recommended for localStorage
  const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

  const validateVideoFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return t('message.invalidVideoFormat');
    }
    if (file.size > MAX_FILE_SIZE) {
      return t('message.videoTooLarge');
    }
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const showSizeWarning = (file: File): boolean => {
    return file.size > RECOMMENDED_SIZE;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateVideoFile(file);
    if (validationError) {
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: validationError,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const videoFileData: VideoFile = {
          name: file.name,
          size: file.size,
          type: file.type as 'video/mp4' | 'video/webm' | 'video/ogg',
          data: reader.result as string,
        };
        onVideoChange(videoFileData);
        
        // Show success message with size warning if needed
        if (showSizeWarning(file)) {
          toast({
            title: "⚠️ Video uploaded",
            description: `"${file.name}" (${formatFileSize(file.size)}) uploaded. Large files may cause storage issues when saving the album.`,
            action: <CheckCircle className="text-yellow-500" />,
            duration: 6000,
          });
        } else {
          toast({
            title: t('message.success'),
            description: `Video file "${file.name}" uploaded successfully.`,
            action: <CheckCircle className="text-green-500" />,
          });
        }
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: t('message.error'),
          description: 'Error reading video file.',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing video file:', error);
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: 'Error processing video file.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveVideo = () => {
    onVideoChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: t('message.success'),
      description: t('message.videoRemoved'),
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const getFileTypeDisplay = (type: string): string => {
    switch (type) {
      case 'video/mp4': return 'MP4';
      case 'video/webm': return 'WebM';
      case 'video/ogg': return 'OGG';
      default: return 'Video';
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">
        {t('form.videoFile')} <span className="text-muted-foreground">(optional)</span>
      </div>
      
      {!videoFile ? (
        <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="p-2 bg-primary/10 rounded-full">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t('placeholder.uploadVideo')}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="btn-glow"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : t('form.uploadVideo')}
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.webm,.ogg,video/mp4,video/webm,video/ogg"
            onChange={handleFileChange}
            disabled={disabled || isProcessing}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-border rounded-lg p-3 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                <Video className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" title={videoFile.name}>
                  {videoFile.name}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{getFileTypeDisplay(videoFile.type)}</span>
                  <span>•</span>
                  <span>{formatFileSize(videoFile.size)}</span>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveVideo}
              disabled={disabled}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Video Preview */}
          <div className="mt-3 pt-3 border-t border-border">
            <video 
              controls 
              src={videoFile.data}
              className="w-full h-32 object-cover rounded-md"
              preload="metadata"
            >
              Your browser does not support the video element.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
