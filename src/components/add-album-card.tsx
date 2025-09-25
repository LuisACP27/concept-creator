import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export function AddAlbumCard({ className }: { className?: string }) {
  return (
    <Link 
      href="/create" 
      className={cn("group block", className)} 
      aria-label="Create new album"
    >
      <div className="flex flex-col gap-2 p-2 sm:gap-3 sm:p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:bg-card/80">
        {/* Card with same size as album */}
        <div className="relative overflow-hidden rounded-md">
          <div className="w-full aspect-square border-2 border-dashed border-primary/50 rounded-md flex items-center justify-center hover:border-primary transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10">
            {/* + Icon */}
            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:scale-110 transition-transform duration-300 animate-pulse-glow" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors duration-300">
            Create New Album
          </h3>
          <p className="text-xs text-muted-foreground">
            Add a new album concept
          </p>
        </div>
      </div>
    </Link>
  );
} 