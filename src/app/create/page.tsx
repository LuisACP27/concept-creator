"use client";

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AlbumForm } from '@/components/album-form';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useLanguage } from '@/contexts/language-context';
import type { Album } from '@/types/album';

export default function CreateAlbumPage() {
  const [, setAlbums] = useLocalStorage<Album[]>("albums", []);
  const { t } = useLanguage();
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div className="relative mb-8">
        <Button asChild variant="ghost" className="absolute -left-4 -top-2">
            <Link href="/">
                <ChevronLeft className="w-5 h-5 mr-1" />
                {t('nav.back')}
            </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center font-headline">
          {t('page.createAlbum')}
        </h1>
      </div>
      <AlbumForm setAlbums={setAlbums} />
    </div>
  );
} 