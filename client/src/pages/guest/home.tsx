import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Play, Download } from 'lucide-react';
import GuestLayout from '@/components/layout/guest-layout';
import MediaCard from '@/components/media-card';
import HorizontalMediaList from '@/components/horizontal-media-list';
import AdvertisementCarousel from '@/components/advertisements/advertisement-carousel';
import i18n from '@/lib/i18n';
import { MediaWithDetails } from '@/lib/types';

export default function GuestHome() {
  const [, navigate] = useLocation();
  
  const { data: featuredMedia } = useQuery<MediaWithDetails>({
    queryKey: ['/api/media/featured'],
  });

  const { data: latestMovies, isLoading: loadingMovies } = useQuery<MediaWithDetails[]>({
    queryKey: ['/api/media', { type: 'movie', limit: 10 }],
  });

  const { data: latestSeries, isLoading: loadingSeries } = useQuery<MediaWithDetails[]>({
    queryKey: ['/api/media', { type: 'series', limit: 10 }],
  });

  return (
    <GuestLayout>
      {/* Hero Section with Advertisement Carousel */}
      <div className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0 z-10">
          <AdvertisementCarousel 
            className="h-full" 
            showControls={true} 
            autoplay={true} 
            interval={8000}
          />
        </div>
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-background via-transparent to-background opacity-80"></div>
        {featuredMedia && (
          <div className="absolute bottom-0 right-0 p-6 md:p-10 w-full max-w-3xl z-30 telegram-slide-up">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{i18n.t('latestEpisode')}</h1>
            <p className="text-gray-300 mb-6 text-sm md:text-base">{featuredMedia.description}</p>
            <div className="flex space-x-4 space-x-reverse">
              <Link to={`/media/${featuredMedia.id}`}>
                <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-3 rounded-md flex items-center transition-all duration-300 transform hover:scale-105">
                  <Play className="h-5 w-5 ml-2" />
                  {i18n.t('watchNow')}
                </Button>
              </Link>
              <Button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-md flex items-center transition-all duration-300 transform hover:scale-105">
                <Download className="h-5 w-5 ml-2" />
                {i18n.t('download')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="px-4 md:px-8 py-8 telegram-slide-up">
        {/* Featured Content Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">{i18n.t('featuredContent')}</h2>
        </div>
        
        {/* Movies Section - Horizontal Scrolling */}
        <HorizontalMediaList 
          title={i18n.t('latestMovies')} 
          media={latestMovies} 
          isLoading={loadingMovies}
          onViewAll={() => navigate('/movies')}
          className="mb-10 telegram-slide-up"
        />

        {/* TV Series Section - Horizontal Scrolling */}
        <HorizontalMediaList 
          title={i18n.t('series')} 
          media={latestSeries} 
          isLoading={loadingSeries}
          onViewAll={() => navigate('/series')}
          className="mb-10 telegram-slide-up"
        />
      </div>
    </GuestLayout>
  );
}
