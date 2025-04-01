import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Play, Download } from 'lucide-react';
import i18n from '@/lib/i18n';
import { MediaWithDetails } from '@/lib/types';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  media: MediaWithDetails;
  onPlay?: () => void;
  onDownload?: () => void;
}

export default function MediaCard({ media, onPlay, onDownload }: MediaCardProps) {
  const handlePlay = (e: React.MouseEvent) => {
    if (onPlay) {
      e.preventDefault();
      onPlay();
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    if (onDownload) {
      e.preventDefault();
      onDownload();
    }
  };

  // Determine badge text and color
  const getBadgeInfo = () => {
    // If media has custom badge text, use it
    if (media.badgeText) {
      return {
        text: media.badgeText,
        bgColor: 'bg-blue-600',
      };
    }
    
    // If media is popular, show "خاص" badge
    if (media.isPopular) {
      return {
        text: 'خاص',
        bgColor: 'bg-gray-700',
      };
    }
    
    // If media is new (less than 3 days old), show "جديد" badge
    if (media.createdAt) {
      const createdDate = new Date(media.createdAt);
      const daysOld = differenceInDays(new Date(), createdDate);
      
      if (daysOld < 3) {
        return {
          text: 'جديد',
          bgColor: 'bg-red-600',
        };
      }
    }
    
    // Return null if no badge should be shown
    return null;
  };
  
  const badgeInfo = getBadgeInfo();

  return (
    <Link to={`/media/${media.id}`}>
      <div className="media-card rounded-lg overflow-hidden relative group block telegram-fade-in transform transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
        <div className="relative">
          <img 
            src={media.thumbnailUrl}
            alt={media.title}
            className="w-full h-48 object-cover transition-all duration-300 ease-out group-hover:scale-105 group-hover:brightness-110"
            loading="lazy"
          />
          
          {/* Badge element (جديد or خاص) */}
          {badgeInfo && (
            <div className={`absolute top-2 left-2 ${badgeInfo.bgColor} text-white text-xs py-1 px-2 rounded-md font-medium z-10 scale-100 group-hover:scale-110 transition-all duration-300 drop-shadow-md`}>
              {badgeInfo.text}
            </div>
          )}
          
          {/* Overlay for hover effect */}
          <div className="media-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 backdrop-blur-[2px] group-hover:backdrop-blur-none">
            <div className="mt-2 flex space-x-2 space-x-reverse translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <Button 
                variant="default" 
                size="icon" 
                className="bg-secondary hover:bg-secondary/90 text-white p-1 rounded-full shadow-lg transform transition hover:scale-110 hover:rotate-3"
                onClick={handlePlay}
              >
                <Play size={18} className="ml-0.5" />
              </Button>
              <Button 
                variant="default" 
                size="icon" 
                className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-full shadow-lg transform transition hover:scale-110 hover:-rotate-3"
                onClick={handleDownload}
              >
                <Download size={18} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Title at the bottom of thumbnail */}
        <div className="px-3 py-2 bg-surface transition-colors duration-300 ease-out group-hover:bg-surface/80">
          <h3 className="font-medium text-white text-sm truncate transition-all duration-300 ease-out group-hover:text-secondary">{media.title}</h3>
          <p className="text-gray-400 text-xs truncate transition-all duration-300 ease-out group-hover:text-gray-300">
            {media.year} • {media.category?.name || ''}
          </p>
        </div>
      </div>
    </Link>
  );
}
