import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import MediaCard from '@/components/media-card';
import { MediaWithDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HorizontalMediaListProps {
  title: string;
  media: MediaWithDetails[] | undefined;
  isLoading: boolean;
  className?: string;
  onViewAll?: () => void;
}

export default function HorizontalMediaList({
  title,
  media,
  isLoading,
  className,
  onViewAll
}: HorizontalMediaListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [media]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className={cn("relative mb-10", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {onViewAll && (
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-surface px-3 py-1 rounded text-sm hover:bg-surface-light transition"
            onClick={onViewAll}
          >
            عرض الكل
          </Button>
        )}
      </div>
      
      <div className="relative overflow-hidden">
        {/* Left scroll button */}
        {showLeftButton && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full w-10 h-10 shadow-lg bg-secondary/80 text-white backdrop-blur-sm"
            onClick={scrollLeft}
          >
            <ChevronLeft size={24} />
          </Button>
        )}
        
        {/* Right scroll button */}
        {showRightButton && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full w-10 h-10 shadow-lg bg-secondary/80 text-white backdrop-blur-sm"
            onClick={scrollRight}
          >
            <ChevronRight size={24} />
          </Button>
        )}
        
        {/* Scrollable container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto overflow-y-hidden scrollbar-hide pb-6 -mx-4 px-4 space-x-4 space-x-reverse"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            // Loading skeleton
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="min-w-[240px] animate-pulse bg-surface rounded-lg h-64 flex-shrink-0"></div>
            ))
          ) : (
            media?.map(item => (
              <div key={item.id} className="min-w-[240px] flex-shrink-0">
                <MediaCard media={item} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}