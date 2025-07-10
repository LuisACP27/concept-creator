"use client";

import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useLanguage } from '@/contexts/language-context';
import type { Album } from '@/types/album';
import { AlbumForm } from '@/components/album-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function EditAlbumPage() {
  const params = useParams();
  const router = useRouter();
  const [albums, setAlbums] = useLocalStorage<Album[]>("albums", []);
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

  const handleDelete = () => {
    if (!album) return;
    setAlbums(albums => albums.filter(a => a.id !== album.id));
    router.push('/');
  };

  if (!isClient) {
    return null;
  }

  if (!album) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <h1 className="text-2xl font-bold">{t('page.albumNotFound')}</h1>
        <p className="text-muted-foreground mt-2">{t('page.albumNotFoundEdit')}</p>
        <Button asChild className="mt-4">
            <Link href="/">{t('nav.goBackHome')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
       <div className="relative mb-8 flex justify-between items-center">
        <Button asChild variant="ghost" className="absolute -left-4 -top-2">
            <Link href="/">
                <ChevronLeft className="w-5 h-5 mr-1" />
                {t('nav.back')}
            </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center font-headline flex-grow">
          {t('page.editAlbum')}
        </h1>
      </div>
      <AlbumForm existingAlbum={album} onDelete={handleDelete} setAlbums={setAlbums} />
    </div>
  );
} 