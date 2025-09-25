"use client";

import Image from "next/image";
import Link from "next/link";
import type { Album } from "@/types/album";
import { cn } from "@/lib/utils";

interface AlbumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  album: Album;
}

export function AlbumCard({ album, className, ...props }: AlbumCardProps) {
  return (
    <Link href={`/view/${album.id}`} className={cn("group block", className)} {...props}>
      <div className="flex flex-col gap-3 p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:bg-card/80">
        <div className="relative overflow-hidden rounded-md">
          <Image
            src={album.coverImage}
            alt={`Cover for ${album.name}`}
            width={300}
            height={300}
            className="w-full h-auto object-cover aspect-square group-hover:scale-110 transition-transform duration-500"
            data-ai-hint="album cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors duration-300">
            {album.name}
          </h3>
          {album.tracks && album.tracks.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {album.tracks.length} track{album.tracks.length !== 1 ? 's' : ''}
              {album.tracks.some(track => track.audioFile) && (
                <span className="ml-1 text-green-500">• Audio</span>
              )}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
} 