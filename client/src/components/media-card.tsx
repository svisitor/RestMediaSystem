import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Play, Download } from 'lucide-react';
import i18n from '@/lib/i18n';
import { MediaWithDetails } from '@/lib/types';
import { differenceInDays } from 'date-fns';

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
      <a className="media-card rounded-lg overflow-hidden relative group block telegram-fade-in">
        <div className="relative">
          <img 
            src={media.thumbnailUrl}
            alt={media.title}
            className="w-full h-56 object-cover transition duration-300 group-hover:scale-105"
          />
          
          {/* Badge element (جديد or خاص) */}
          {badgeInfo && (
            <div className={`absolute top-2 left-2 ${badgeInfo.bgColor} text-white text-xs py-1 px-2 rounded font-medium transition-transform z-10 telegram-slide-up`}>
              {badgeInfo.text}
            </div>
          )}
          
          {/* Overlay for hover effect */}
          <div className="media-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3">
            <div className="mt-2 flex space-x-2 space-x-reverse">
              <Button 
                variant="default" 
                size="icon" 
                className="bg-secondary hover:bg-secondary-dark text-white p-1 rounded-full"
                onClick={handlePlay}
              >
                <Play size={20} />
              </Button>
              <Button 
                variant="default" 
                size="icon" 
                className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-full"
                onClick={handleDownload}
              >
                <Download size={20} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Title at the bottom of thumbnail */}
        <div className="px-2 py-3 bg-surface">
          <h3 className="font-medium text-white text-sm truncate">{media.title}</h3>
          <p className="text-gray-300 text-xs truncate">
            {media.year} • {media.category?.name || ''}
          </p>
        </div>
      </a>
    </Link>
  );
}
