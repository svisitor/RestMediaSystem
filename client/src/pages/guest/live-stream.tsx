import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import GuestLayout from '@/components/layout/guest-layout';
import { VideoPlayer } from '@/components/ui/video-player';
import i18n from '@/lib/i18n';
import { LiveStreamWithTimeRemaining } from '@/lib/types';

export default function LiveStream() {
  const { data: activeStream, isLoading } = useQuery<LiveStreamWithTimeRemaining>({
    queryKey: ['/api/live-streams/active'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: upcomingStreams } = useQuery<LiveStreamWithTimeRemaining[]>({
    queryKey: ['/api/live-streams/upcoming'],
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <GuestLayout showLiveStreamBanner={false}>
      <div className="px-4 md:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">{i18n.t('liveStream')}</h1>
        
        {isLoading ? (
          <div className="bg-surface rounded-lg p-4 animate-pulse h-96"></div>
        ) : activeStream ? (
          <div className="mb-8">
            <div className="mb-4 flex items-center">
              <span className="flex items-center text-red-500 font-medium">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2 pulse"></span>
                {i18n.t('liveNow')}
              </span>
              <h2 className="text-xl font-bold ml-2">{activeStream.title}</h2>
            </div>
            
            <div className="rounded-lg overflow-hidden mb-4">
              <VideoPlayer
                src={activeStream.streamUrl}
                title={activeStream.title}
              />
            </div>
            
            <div className="bg-surface rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{activeStream.title}</h3>
              <p className="text-gray-300 mb-4">{activeStream.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 ml-1" />
                  {formatDate(activeStream.startTime)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 ml-1" />
                  {formatTime(activeStream.startTime)} - {formatTime(activeStream.endTime)}
                </div>
                <div className="bg-accent-dark text-white px-2 py-1 rounded-md text-xs">
                  {activeStream.category}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-lg p-6 mb-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium mb-2">لا يوجد بث مباشر حالياً</h3>
            <p className="text-gray-400">
              تحقق من قائمة البث المباشر القادم أدناه للبقاء على اطلاع بالأحداث القادمة.
            </p>
          </div>
        )}
        
        {/* Upcoming Streams */}
        <h2 className="text-2xl font-bold mb-4">البث القادم</h2>
        
        {upcomingStreams && upcomingStreams.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingStreams.map((stream) => (
              <div key={stream.id} className="bg-surface rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-secondary font-bold text-lg">{i18n.t('upcoming')}</div>
                    {stream.minutesRemaining !== undefined && (
                      <div className="text-sm text-gray-300">
                        {i18n.t('starting')} {stream.minutesRemaining} {i18n.t('minutes')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{stream.title}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{stream.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 ml-1" />
                      {formatDate(stream.startTime)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 ml-1" />
                      {formatTime(stream.startTime)}
                    </div>
                    <div className="bg-accent-dark text-white px-2 py-0.5 rounded-md text-xs">
                      {stream.category}
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    className="w-full bg-secondary text-white hover:bg-secondary-dark"
                    disabled
                  >
                    سيبدأ قريباً
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-lg p-6 text-center">
            <p className="text-gray-400">لا يوجد بث مباشر مجدول حالياً.</p>
          </div>
        )}
      </div>
    </GuestLayout>
  );
}
