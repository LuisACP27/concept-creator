import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export function AddAlbumCard({ className }: { className?: string }) {
  return (
    <Link 
      href="/create" 
      className={cn("group w-full", className)} 
      aria-label="Create new album"
    >
      <div className="flex flex-col gap-4">
        {/* Card with same size as album */}
        <div className="w-full aspect-square border-2 border-dashed border-primary/50 rounded-md flex items-center justify-center hover:border-primary transition-all duration-300">
          {/* + Icon */}
          <Plus className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300 animate-pulse-glow" />
        </div>
      </div>
    </Link>
  );
} 