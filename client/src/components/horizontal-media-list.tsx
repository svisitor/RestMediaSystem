import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import MediaCard from '@/components/media-card';
import { MediaWithDetails } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DataStateWrapper } from '@/components/ui/data-states';
import i18n from '@/lib/i18n';

interface HorizontalMediaListProps {
  title: string;
  media: MediaWithDetails[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  className?: string;
  onViewAll?: () => void;
}

export default function HorizontalMediaList({
  title,
  media,
  isLoading,
  isError = false,
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
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount = Math.max(containerWidth * 0.75, 400); // Scroll 75% of container width
      scrollContainerRef.current.scrollBy({ 
        left: -scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount = Math.max(containerWidth * 0.75, 400); // Scroll 75% of container width
      scrollContainerRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: 'smooth' 
      });
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
          <DataStateWrapper
            isLoading={isLoading}
            isError={isError}
            isEmpty={!media || media.length === 0}
            loadingMessage={i18n.t('loadingContent')}
            errorMessage={i18n.t('errorLoadingContent')}
            emptyMessage={i18n.t('noContentAvailable')}
            className="flex"
          >
            {isLoading ? (
              // Loading skeleton
              Array(10).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className="min-w-[180px] flex-shrink-0"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="animate-pulse bg-surface rounded-lg overflow-hidden">
                    <div className="h-48 bg-gray-800/50"></div>
                    <div className="p-3">
                      <div className="h-3 bg-gray-700 rounded mb-2"></div>
                      <div className="h-2 bg-gray-700/60 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              media?.map((item, index) => (
                <div
                  key={item.id} 
                  className="min-w-[180px] flex-shrink-0 transition-transform duration-500"
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    transform: `translateZ(0)` // Forces GPU acceleration
                  }}
                >
                  <MediaCard media={item} />
                </div>
              ))
            )}
          </DataStateWrapper>
        </div>
      </div>
    </div>
  );
}