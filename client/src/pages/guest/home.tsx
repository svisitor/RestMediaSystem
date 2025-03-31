import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Play, Download } from 'lucide-react';
import GuestLayout from '@/components/layout/guest-layout';
import MediaCard from '@/components/media-card';
import AdvertisementCarousel from '@/components/advertisements/advertisement-carousel';
import i18n from '@/lib/i18n';
import { MediaWithDetails } from '@/lib/types';

export default function GuestHome() {
  const { data: featuredMedia } = useQuery<MediaWithDetails>({
    queryKey: ['/api/media/featured'],
  });

  const { data: latestMovies, isLoading: loadingMovies } = useQuery<MediaWithDetails[]>({
    queryKey: ['/api/media', { type: 'movie', limit: 5 }],
  });

  const { data: latestSeries, isLoading: loadingSeries } = useQuery<MediaWithDetails[]>({
    queryKey: ['/api/media', { type: 'series', limit: 5 }],
  });

  return (
    <GuestLayout>
      {/* Hero Section */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        {featuredMedia ? (
          <>
            <img 
              src={featuredMedia.thumbnailUrl} 
              alt={featuredMedia.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
            <div className="absolute bottom-0 right-0 p-6 md:p-10 w-full max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{i18n.t('latestEpisode')}</h1>
              <p className="text-gray-300 mb-4 text-sm md:text-base">{featuredMedia.description}</p>
              <div className="flex space-x-4 space-x-reverse">
                <Link to={`/media/${featuredMedia.id}`}>
                  <Button className="bg-secondary hover:bg-secondary-dark text-white px-6 py-2 rounded-md flex items-center transition">
                    <Play className="h-5 w-5 ml-2" />
                    {i18n.t('watchNow')}
                  </Button>
                </Link>
                <Button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md flex items-center transition">
                  <Download className="h-5 w-5 ml-2" />
                  {i18n.t('download')}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary">
            <div className="animate-pulse bg-gray-700 h-full w-full"></div>
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="px-4 md:px-8 py-8">
        {/* Advertisement Section */}
        <div className="mb-8">
          <AdvertisementCarousel showControls={true} />
        </div>
        
        {/* Movies Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{i18n.t('latestMovies')}</h2>
            <div className="flex space-x-2 space-x-reverse">
              <Link to="/movies">
                <Button variant="outline" size="sm" className="bg-surface px-3 py-1 rounded text-sm hover:bg-surface-light transition">
                  {i18n.t('all')}
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="bg-surface px-3 py-1 rounded text-sm hover:bg-surface-light transition">
                {i18n.t('action')}
              </Button>
              <Button variant="outline" size="sm" className="bg-surface px-3 py-1 rounded text-sm hover:bg-surface-light transition">
                {i18n.t('drama')}
              </Button>
              <Button variant="outline" size="sm" className="bg-surface px-3 py-1 rounded text-sm hover:bg-surface-light transition">
                {i18n.t('comedy')}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loadingMovies ? (
              // Loading skeleton
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-surface rounded-lg h-64"></div>
              ))
            ) : (
              latestMovies?.map(movie => (
                <MediaCard
                  key={movie.id}
                  media={movie}
                />
              ))
            )}
          </div>
        </div>

        {/* TV Series Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{i18n.t('series')}</h2>
            <div className="flex space-x-2 space-x-reverse">
              <Link to="/series">
                <Button variant="outline" size="sm" className="bg-surface px-3 py-1 rounded text-sm hover:bg-surface-light transition">
                  {i18n.t('all')}
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="bg-surface px-3 py-1 rounded text-sm hover:bg-surface-light transition">
                {i18n.t('drama')}
              </Button>
              <Button variant="outline" size="sm" className="bg-surface px-3 py-1 rounded text-sm hover:bg-surface-light transition">
                {i18n.t('comedy')}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loadingSeries ? (
              // Loading skeleton
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-surface rounded-lg h-64"></div>
              ))
            ) : (
              latestSeries?.map(series => (
                <MediaCard
                  key={series.id}
                  media={series}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
