"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { Music, Upload, X, CheckCircle } from "lucide-react";
import type { AudioFile } from "@/types/album";

interface AudioUploadProps {
  audioFile?: AudioFile;
  onAudioChange: (audioFile: AudioFile | undefined) => void;
  disabled?: boolean;
}

export function AudioUpload({ audioFile, onAudioChange, disabled }: AudioUploadProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const RECOMMENDED_SIZE = 3 * 1024 * 1024; // 3MB recommended for localStorage
  const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav'];

  const validateAudioFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return t('message.invalidAudioFormat');
    }
    if (file.size > MAX_FILE_SIZE) {
      return t('message.audioTooLarge');
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
    const validationError = validateAudioFile(file);
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
        const audioFileData: AudioFile = {
          name: file.name,
          size: file.size,
          type: file.type as 'audio/wav' | 'audio/mpeg',
          data: reader.result as string,
        };
        onAudioChange(audioFileData);
        
        // Show success message with size warning if needed
        if (showSizeWarning(file)) {
          toast({
            title: "⚠️ Audio uploaded",
            description: `"${file.name}" (${formatFileSize(file.size)}) uploaded. Large files may cause storage issues when saving the album.`,
            action: <CheckCircle className="text-yellow-500" />,
            duration: 6000,
          });
        } else {
          toast({
            title: t('message.success'),
            description: `Audio file "${file.name}" uploaded successfully.`,
            action: <CheckCircle className="text-green-500" />,
          });
        }
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: t('message.error'),
          description: 'Error reading audio file.',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing audio file:', error);
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: 'Error processing audio file.',
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

  const handleRemoveAudio = () => {
    onAudioChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: t('message.success'),
      description: t('message.audioRemoved'),
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const getFileTypeDisplay = (type: string): string => {
    return type === 'audio/mpeg' ? 'MP3' : 'WAV';
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">
        {t('form.audioFile')} <span className="text-muted-foreground">(optional)</span>
      </div>
      
      {!audioFile ? (
        <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="p-2 bg-primary/10 rounded-full">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t('placeholder.uploadAudio')}
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
                {isProcessing ? 'Processing...' : t('form.uploadAudio')}
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
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
                <Music className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" title={audioFile.name}>
                  {audioFile.name}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{getFileTypeDisplay(audioFile.type)}</span>
                  <span>•</span>
                  <span>{formatFileSize(audioFile.size)}</span>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveAudio}
              disabled={disabled}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Audio Preview */}
          <div className="mt-3 pt-3 border-t border-border">
            <audio 
              controls 
              src={audioFile.data}
              className="w-full h-8"
              preload="metadata"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )}
    </div>
  );
}
