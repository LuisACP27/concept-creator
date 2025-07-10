"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import type { Album, Track } from "@/types/album";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { CheckCircle, ImageIcon, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

interface AlbumFormProps {
    existingAlbum?: Album;
    setAlbums: (value: Album[] | ((val: Album[]) => Album[])) => void;
    onDelete?: () => void;
}

export function AlbumForm({ existingAlbum, setAlbums, onDelete }: AlbumFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: existingAlbum?.name || "",
    styleDescription: existingAlbum?.styleDescription || "",
    concept: existingAlbum?.concept || "",
    targetAudience: existingAlbum?.targetAudience || "",
    lyricalContent: existingAlbum?.lyricalContent || "",
    productionAndSound: existingAlbum?.productionAndSound || "",
    coverImage: existingAlbum?.coverImage || "",
  });

  const [tracks, setTracks] = useState<Track[]>(existingAlbum?.tracks || []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addTrack = () => {
    setTracks(prev => [...prev, { title: "", description: "" }]);
  };

  const removeTrack = (index: number) => {
    setTracks(prev => prev.filter((_, i) => i !== index));
  };

  const updateTrack = (index: number, field: keyof Track, value: string) => {
    setTracks(prev => prev.map((track, i) => 
      i === index ? { ...track, [field]: value } : track
    ));
  };

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === tracks.length - 1)) {
      return;
    }

    const newTracks = [...tracks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newTracks[index], newTracks[targetIndex]] = [newTracks[targetIndex], newTracks[index]];
    setTracks(newTracks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: t('message.albumNameRequired'),
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.coverImage && !existingAlbum) {
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: t('message.coverImageRequired'),
      });
      setIsSubmitting(false);
      return;
    }

    // Validate that songs have at least a title
    const invalidTracks = tracks.some(track => !track.title.trim());
    if (invalidTracks) {
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: t('message.allSongsNeedTitle'),
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const albumData: Album = {
        id: existingAlbum?.id || crypto.randomUUID(),
        name: formData.name,
        coverImage: formData.coverImage,
        styleDescription: formData.styleDescription,
        concept: formData.concept,
        targetAudience: formData.targetAudience,
        lyricalContent: formData.lyricalContent,
        productionAndSound: formData.productionAndSound,
        tracks: tracks.filter(track => track.title.trim()), // Only include tracks with title
      };

      if (existingAlbum) {
        setAlbums(albums => albums.map(a => a.id === albumData.id ? albumData : a));
        toast({
          title: t('message.success'),
          description: t('message.albumUpdated'),
          action: <CheckCircle className="text-green-500" />,
        });
      } else {
        setAlbums(albums => [...albums, albumData]);
        toast({
          title: t('message.success'),
          description: t('message.albumCreated'),
          action: <CheckCircle className="text-green-500" />,
        });
      }
      
      router.push('/');
    } catch (error) {
      console.error('Error saving album:', error);
      toast({
        variant: "destructive",
        title: t('message.error'),
        description: t('message.errorSaving'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeInUp">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <label className="text-lg font-semibold block mb-2 text-glow">
              {t('form.coverArt')} <span className="text-destructive">*</span>
            </label>
            <Card className="aspect-square border-dashed flex flex-col items-center justify-center text-center p-4 relative card-glow hover:border-primary/50 transition-all duration-300">
              {formData.coverImage ? (
                <img 
                  src={formData.coverImage} 
                  alt="Cover preview" 
                  className="absolute inset-0 w-full h-full object-cover rounded-md transition-transform duration-300 hover:scale-105" 
                />
              ) : (
                <div className="space-y-2 text-muted-foreground animate-float">
                  <ImageIcon className="mx-auto h-12 w-12 text-primary animate-pulse-glow" />
                  <p className="text-sm">{t('placeholder.uploadImage')}</p>
                </div>
              )}
              <input 
                type="file"
                accept="image/png, image/jpeg, image/gif"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageUpload}
              />
            </Card>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <label className="text-lg font-semibold block mb-2 text-shimmer">
                {t('form.albumName')} <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder={t('placeholder.albumName')}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-glow"
              />
            </div>

            <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <label className="text-lg font-semibold block mb-2">
                {t('form.styleDescription')}
              </label>
              <Textarea
                placeholder={t('placeholder.styleDescription')}
                value={formData.styleDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, styleDescription: e.target.value }))}
                className="input-glow"
              />
            </div>

            <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <label className="text-lg font-semibold block mb-2">
                {t('form.concept')}
              </label>
              <Textarea
                placeholder={t('placeholder.concept')}
                value={formData.concept}
                onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))}
                className="input-glow"
              />
            </div>

            <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <label className="text-lg font-semibold block mb-2">
                {t('form.targetAudience')}
              </label>
              <Textarea
                placeholder={t('placeholder.targetAudience')}
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="input-glow"
              />
            </div>

            <div className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
              <label className="text-lg font-semibold block mb-2">
                {t('form.lyricalContent')}
              </label>
              <Textarea
                placeholder={t('placeholder.lyricalContent')}
                value={formData.lyricalContent}
                onChange={(e) => setFormData(prev => ({ ...prev, lyricalContent: e.target.value }))}
                className="input-glow"
              />
            </div>

            <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <label className="text-lg font-semibold block mb-2">
                {t('form.productionSound')}
              </label>
              <Textarea
                placeholder={t('placeholder.productionSound')}
                value={formData.productionAndSound}
                onChange={(e) => setFormData(prev => ({ ...prev, productionAndSound: e.target.value }))}
                className="input-glow"
              />
            </div>
          </div>
        </div>

        {/* Tracklist Section */}
        <div className="border-t pt-8 glass-card rounded-lg p-6 animate-scale-in" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-glow">{t('form.tracklist')}</h3>
            <Button
              type="button"
              onClick={addTrack}
              variant="outline"
              size="sm"
              className="btn-glow gradient-primary text-primary-foreground border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('form.addSong')}
            </Button>
          </div>

          {tracks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground animate-float">
              <p className="text-glow">{t('message.noSongsAdded')}</p>
              <p className="text-sm animate-shimmer">{t('message.noSongsDescription')}</p>
            </div>
          )}

          <div className="space-y-4">
            {tracks.map((track, index) => (
              <Card key={index} className="p-4 card-glow glass-card animate-scale-in" style={{ animationDelay: `${0.8 + index * 0.1}s` }}>
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    {/* Order controls */}
                    <div className="flex flex-col gap-1 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveTrack(index, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0 btn-glow"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <div className="flex items-center justify-center w-6 h-6 text-xs font-medium bg-primary/20 text-primary rounded animate-pulse-glow">
                        {index + 1}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveTrack(index, 'down')}
                        disabled={index === tracks.length - 1}
                        className="h-6 w-6 p-0 btn-glow"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Song content */}
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium block mb-1">
                            {t('form.songTitle')} <span className="text-destructive">*</span>
                          </label>
                          <Input
                            placeholder={t('placeholder.songTitle')}
                            value={track.title}
                            onChange={(e) => updateTrack(index, 'title', e.target.value)}
                            className="input-glow"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTrack(index)}
                            className="w-full md:w-auto btn-glow"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('form.remove')}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          {t('form.description')}
                        </label>
                        <Textarea
                          placeholder={t('placeholder.songDescription')}
                          value={track.description || ""}
                          onChange={(e) => updateTrack(index, 'description', e.target.value)}
                          className="min-h-[80px] input-glow"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 pt-8 border-t animate-scale-in" style={{ animationDelay: '1s' }}>
          {existingAlbum && onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={isSubmitting} className="btn-glow">
              {t('form.deleteAlbum')}
            </Button>
          )}
          <Button type="submit" size="lg" disabled={isSubmitting} className="btn-glow gradient-primary text-primary-foreground border-0">
            {isSubmitting ? t('form.saving') : (existingAlbum ? t('form.updateAlbum') : t('form.createAlbum'))}
          </Button>
        </div>
      </form>
    </div>
  );
} 