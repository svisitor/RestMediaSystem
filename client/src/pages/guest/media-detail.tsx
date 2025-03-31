import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Download, Calendar, User } from 'lucide-react';
import GuestLayout from '@/components/layout/guest-layout';
import { VideoPlayer } from '@/components/ui/video-player';
import i18n from '@/lib/i18n';
import { SeriesWithDetails } from '@/lib/types';

export default function MediaDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

  const { data: media, isLoading } = useQuery<SeriesWithDetails>({
    queryKey: ['/api/media', id],
  });

  if (isLoading) {
    return (
      <GuestLayout>
        <div className="px-4 md:px-8 py-8">
          <div className="animate-pulse bg-surface h-96 rounded-lg mb-6"></div>
          <div className="animate-pulse bg-surface h-10 w-40 rounded-md mb-4"></div>
          <div className="animate-pulse bg-surface h-4 rounded mb-2"></div>
          <div className="animate-pulse bg-surface h-4 rounded mb-2 w-3/4"></div>
        </div>
      </GuestLayout>
    );
  }

  if (!media) {
    navigate('/not-found');
    return null;
  }

  const isMovie = media.type === 'movie';
  const currentSeason = media.seasons?.find(s => s.seasonNumber === selectedSeason);
  const currentEpisode = selectedEpisode !== null && currentSeason 
    ? currentSeason.episodes?.find(e => e.episodeNumber === selectedEpisode) 
    : null;

  return (
    <GuestLayout>
      <div className="px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Media Poster */}
          <div className="md:col-span-1">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={media.thumbnailUrl} 
                alt={media.title} 
                className="w-full object-cover"
              />
            </div>
          </div>
          
          {/* Media Info */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{media.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-secondary bg-opacity-20 text-secondary px-2 py-1 rounded text-sm">
                {media.type === 'movie' ? i18n.t('movie') : i18n.t('tvSeries')}
              </span>
              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
                {media.category?.name}
              </span>
              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm flex items-center">
                <Calendar className="h-3 w-3 ml-1" />
                {media.year}
              </span>
            </div>
            
            <p className="text-gray-300 mb-6">
              {media.description}
            </p>
            
            {isMovie ? (
              <div className="flex space-x-4 space-x-reverse">
                <Button className="bg-secondary hover:bg-secondary-dark text-white flex items-center">
                  <Play className="h-5 w-5 ml-2" />
                  {i18n.t('watchNow')}
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 flex items-center">
                  <Download className="h-5 w-5 ml-2" />
                  {i18n.t('download')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">المواسم والحلقات</h2>
                {media.seasons && media.seasons.length > 0 ? (
                  <Tabs 
                    defaultValue={selectedSeason.toString()} 
                    onValueChange={(value) => setSelectedSeason(parseInt(value))}
                  >
                    <TabsList className="mb-4">
                      {media.seasons.map((season) => (
                        <TabsTrigger 
                          key={season.id} 
                          value={season.seasonNumber.toString()}
                          className="data-[state=active]:bg-secondary data-[state=active]:text-white"
                        >
                          {i18n.t('season')} {season.seasonNumber}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {media.seasons.map((season) => (
                      <TabsContent 
                        key={season.id} 
                        value={season.seasonNumber.toString()}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {season.episodes?.map((episode) => (
                            <div 
                              key={episode.id}
                              className={`p-3 rounded-md cursor-pointer ${
                                selectedEpisode === episode.episodeNumber
                                  ? 'bg-secondary'
                                  : 'bg-surface hover:bg-surface-light'
                              }`}
                              onClick={() => setSelectedEpisode(episode.episodeNumber)}
                            >
                              <div className="font-medium">
                                {i18n.t('episode')} {episode.episodeNumber}
                              </div>
                              <div className="text-sm text-gray-300">{episode.title}</div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-gray-400">لا توجد مواسم متاحة حالياً</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Video Player (for both movies and series) */}
        {(isMovie || currentEpisode) && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">
              {isMovie ? i18n.t('watchNow') : `${i18n.t('season')} ${selectedSeason} - ${i18n.t('episode')} ${selectedEpisode}`}
            </h2>
            <div className="rounded-lg overflow-hidden">
              <VideoPlayer
                src={isMovie ? media.filePath : (currentEpisode?.filePath || '')}
                title={isMovie ? media.title : `${media.title} - ${i18n.t('season')} ${selectedSeason} ${i18n.t('episode')} ${selectedEpisode}`}
                onDownload={() => {
                  // Download functionality
                  const link = document.createElement('a');
                  link.href = isMovie ? media.filePath : (currentEpisode?.filePath || '');
                  link.download = isMovie ? media.title : `${media.title} - S${selectedSeason}E${selectedEpisode}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </GuestLayout>
  );
}
