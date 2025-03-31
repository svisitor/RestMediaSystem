import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Play, Download } from 'lucide-react';
import i18n from '@/lib/i18n';
import { MediaWithDetails } from '@/lib/types';

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

  return (
    <Link to={`/media/${media.id}`}>
      <a className="media-card rounded-lg overflow-hidden relative group block">
        <img 
          src={media.thumbnailUrl}
          alt={media.title}
          className="w-full h-64 object-cover transition duration-300"
        />
        <div className="media-overlay opacity-0 absolute inset-0 bg-gradient-to-t from-black to-transparent bg-opacity-80 transition duration-300 flex flex-col justify-end p-3">
          <h3 className="font-medium text-white">{media.title}</h3>
          <p className="text-gray-300 text-sm">
            {media.year} • {media.category?.name || ''}
          </p>
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
      </a>
    </Link>
  );
}
