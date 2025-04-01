import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Play, Download } from 'lucide-react';
import AppLayout from '@/components/layout/app-layout';
import MediaCard from '@/components/media-card';
import HorizontalMediaList from '@/components/horizontal-media-list';
import AdvertisementCarousel from '@/components/advertisements/advertisement-carousel';
import i18n from '@/lib/i18n';
import { MediaWithDetails } from '@/lib/types';
import { DataStateWrapper } from '@/components/ui/data-states';

export default function GuestHome() {
  const [, navigate] = useLocation();
  
  // Removed featured media query as we're now using advertisements carousel directly

  const { 
    data: latestMovies, 
    isLoading: loadingMovies, 
    isError: errorMovies 
  } = useQuery<MediaWithDetails[]>({
    queryKey: ['/api/media', { type: 'movie', limit: 10 }],
  });

  const { 
    data: latestSeries, 
    isLoading: loadingSeries, 
    isError: errorSeries 
  } = useQuery<MediaWithDetails[]>({
    queryKey: ['/api/media', { type: 'series', limit: 10 }],
  });

  return (
    <AppLayout>
      {/* Hero Section with Advertisement Carousel */}
      <div className="relative h-[70vh] overflow-hidden rounded-lg mb-6">
        <div className="absolute inset-0 z-10">
          <AdvertisementCarousel 
            className="h-full" 
            showControls={true} 
            autoplay={true} 
            interval={8000}
          />
        </div>
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-background/30 via-transparent to-background/80"></div>
      </div>

      {/* Content Sections */}
      <div className="px-4 md:px-8 py-8 telegram-slide-up">
        
        {/* Movies Section - Horizontal Scrolling */}
        <HorizontalMediaList 
          title={i18n.t('latestMovies')} 
          media={latestMovies} 
          isLoading={loadingMovies}
          isError={errorMovies}
          onViewAll={() => navigate('/movies')}
          className="mb-10 telegram-slide-up"
        />

        {/* TV Series Section - Horizontal Scrolling */}
        <HorizontalMediaList 
          title={i18n.t('series')} 
          media={latestSeries} 
          isLoading={loadingSeries}
          isError={errorSeries}
          onViewAll={() => navigate('/series')}
          className="mb-10 telegram-slide-up"
        />
      </div>
    </AppLayout>
  );
}
