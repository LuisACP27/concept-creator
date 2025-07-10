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
    <Link href={`/view/${album.id}`} className={cn("group w-full", className)} {...props}>
      <div className="flex flex-col gap-4">
        <Image
          src={album.coverImage}
          alt={`Cover for ${album.name}`}
          width={400}
          height={400}
          className="w-full h-auto object-cover aspect-square group-hover:opacity-80 transition-all duration-300 rounded-md group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:scale-105"
          data-ai-hint="album cover"
        />
        <p className="text-lg font-medium transition-all duration-300 group-hover:scale-105">{album.name}</p>
      </div>
    </Link>
  );
} 