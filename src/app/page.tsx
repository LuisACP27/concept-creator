"use client";

import { useState, useEffect } from "react";
import type { Album } from "@/types/album";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLanguage } from "@/contexts/language-context";
import { AlbumCard } from "@/components/album-card";
import { AddAlbumCard } from "@/components/add-album-card";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function Home() {
  const [albums] = useLocalStorage<Album[]>("albums", []);
  const [isClient, setIsClient] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-md">
      <header className="text-left mb-10 animate-fadeInUp relative">
        <div className="absolute top-0 right-0">
          <LanguageSwitcher />
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-wider text-shimmer">
          {t('app.title')}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg animate-float tracking-wide">
          {t('app.subtitle')}
        </p>
      </header>

      {isClient && (
        <div className="flex flex-col items-start gap-12">
          <div className="animate-pulse-glow">
            <AddAlbumCard />
          </div>
          {albums.map((album, index) => (
            <AlbumCard
              key={album.id}
              album={album}
              className="opacity-0 animate-fadeInUp"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            />
          ))}
        </div>
      )}

      {isClient && albums.length === 0 && (
         <div className="text-left mt-16 text-muted-foreground flex flex-col items-start animate-scale-in">
            <h2 className="text-2xl font-semibold text-glow">{t('app.noAlbums')}</h2>
            <p>{t('app.noAlbumsDescription')}</p>
        </div>
      )}
    </div>
  );
} 