"use client";

import { useState, useEffect } from "react";
import type { Album } from "@/types/album";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLanguage } from "@/contexts/language-context";
import { AlbumCard } from "@/components/album-card";
import { AddAlbumCard } from "@/components/add-album-card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ExportImportButtons } from "@/components/export-import-buttons";

export default function Home() {
  const [albums, setAlbums] = useLocalStorage<Album[]>("albums", []);
  const [isClient, setIsClient] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsClient(true);
    // Debug log to track albums on home page
    console.log(`🏠 DEBUG: Home page albums:`, albums);
    console.log(`🏠 DEBUG: Home page albums count:`, albums.length);
  }, [albums]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
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
        <div className="space-y-12">
          {/* Export/Import Section */}
          <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
            <ExportImportButtons 
              albums={albums} 
              onImportAlbums={setAlbums}
            />
          </div>
          
          {/* Albums Grid with Add Album Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add Album Button - First in grid */}
            <div className="animate-pulse-glow">
              <AddAlbumCard />
            </div>
            
            {/* Existing Albums */}
            {albums.map((album, index) => (
              <AlbumCard
                key={album.id}
                album={album}
                className="opacity-0 animate-fadeInUp"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              />
            ))}
          </div>
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