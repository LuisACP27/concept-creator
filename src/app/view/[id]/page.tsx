"use client";

import { useParams } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useLanguage } from '@/contexts/language-context';
import type { Album } from '@/types/album';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function ViewAlbumPage() {
  const params = useParams();
  const [albums] = useLocalStorage<Album[]>("albums", []);
  const [album, setAlbum] = useState<Album | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const { t } = useLanguage();

  const albumId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    setIsClient(true);
    if (albumId) {
      const foundAlbum = albums.find(a => a.id === albumId);
      setAlbum(foundAlbum);
    }
  }, [albumId, albums]);

  if (!isClient) {
    return null;
  }

  if (!album) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <h1 className="text-2xl font-bold">{t('page.albumNotFound')}</h1>
        <p className="text-muted-foreground mt-2">{t('page.albumNotFoundDescription')}</p>
        <Button asChild className="mt-4">
            <Link href="/">{t('nav.backToHome')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <Button asChild variant="ghost">
            <Link href="/">
                <ChevronLeft className="w-5 h-5 mr-1" />
                {t('nav.back')}
            </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center font-headline">
          {album.name}
        </h1>
        <Button asChild variant="outline">
            <Link href={`/edit/${album.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                {t('nav.edit')}
            </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="overflow-hidden bg-transparent border-0 shadow-none">
            <CardContent className="p-0 aspect-square">
               <Image
                  src={album.coverImage}
                  alt={`${album.name} cover`}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover rounded-md"
                />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
            {album.styleDescription && <InfoSection title={t('view.styleDescription')} content={album.styleDescription} />}
            {album.concept && <InfoSection title={t('view.concept')} content={album.concept} />}
            {album.targetAudience && <InfoSection title={t('view.targetAudience')} content={album.targetAudience} />}
            {album.lyricalContent && <InfoSection title={t('view.lyricalContent')} content={album.lyricalContent} />}
            {album.productionAndSound && <InfoSection title={t('view.productionSound')} content={album.productionAndSound} />}
        </div>
      </div>
      
      {album.tracks && album.tracks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mt-8 mb-6">{t('view.tracklist')}</h2>
            <div className="space-y-4">
                {album.tracks.map((track, index) => (
                    <Card key={index} className="p-4 bg-background/50">
                        <div className="flex flex-col gap-2">
                           <div>
                             <p className="font-semibold text-lg">
                                {index + 1}. {track.title}
                             </p>
                             {track.description && <p className="text-muted-foreground text-sm mt-1">{track.description}</p>}
                           </div>
                           {track.audioSrc && (
                               <audio controls src={track.audioSrc} className="w-full h-10 mt-2"></audio>
                           )}
                        </div>
                    </Card>
                ))}
            </div>
          </div>
      )}
    </div>
  );
}

function InfoSection({ title, content }: { title: string, content: string }) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{content}</p>
        </div>
    )
} 