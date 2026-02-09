import { useRecoilValue } from "recoil";
import { songAtom } from "@/global-states/song-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkIcon, Calendar, Clock, User, Hash } from "lucide-react";
import { getTimePassedFromTimestamp, OpenYoutubeLink } from "@/components/util/helper/helper-functions";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  teamId: string
  songId: string
}

export function SongMetadata({ teamId, songId }: Props) {
  const song = useRecoilValue(songAtom({ teamId, songId }));

  if (!song) return null;

  const handleLinkClick = () => {
    if (song?.original?.url) {
      OpenYoutubeLink(song.original.url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Title Section - Editorial style */}
      <div className="space-y-2 pb-6 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          {song.title}
        </h2>
        {song.subtitle && (
          <p className="text-base text-muted-foreground font-medium">
            {song.subtitle}
          </p>
        )}
      </div>

      {/* Key Information Grid */}
      <div className="space-y-6">
        {/* Author */}
        {song.original?.author && (
          <MetadataRow
            icon={<User className="h-4 w-4" />}
            label="Artist"
            value={song.original.author}
          />
        )}

        {/* Keys - Prominent display */}
        {song.keys && song.keys.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Hash className="h-3.5 w-3.5" />
              Available Keys
            </div>
            <div className="flex flex-wrap gap-2">
              {song.keys.map((key, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="font-mono text-sm font-bold px-3 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  {key}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {song.tags && song.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {song.tags.map((tag, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs px-2.5 py-1 border-muted-foreground/20 hover:bg-muted/50 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Link */}
        {song.original?.url && (
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleLinkClick}
              className="w-full justify-start gap-3 h-12 rounded-xl border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all group"
            >
              <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">View Original Source</span>
            </Button>
          </div>
        )}
      </div>

      {/* Timeline Information */}
      <div className="space-y-4 pt-6 border-t border-border/50">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Timeline
        </div>

        {/* Last Used */}
        {song.last_used_time && (
          <MetadataRow
            icon={<Clock className="h-4 w-4" />}
            label="Last Used"
            value={
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {new Date(song.last_used_time.seconds * 1000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getTimePassedFromTimestamp(song.last_used_time)}
                </div>
              </div>
            }
          />
        )}

        {/* Created */}
        {song.created_by?.time && (
          <MetadataRow
            icon={<Calendar className="h-4 w-4" />}
            label="Created"
            value={
              <div className="text-sm font-medium text-foreground">
                {new Date(song.created_by.time.seconds * 1000).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            }
          />
        )}
      </div>

      {/* Description */}
      {song.description && (
        <div className="space-y-3 pt-6 border-t border-border/50">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Notes
          </div>
          <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {song.description}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MetadataRow({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode | string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide truncate">
          {label}
        </span>
      </div>
      <div className="flex-shrink-0">
        {typeof value === 'string' ? (
          <span className="text-sm font-medium text-foreground">
            {value}
          </span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
