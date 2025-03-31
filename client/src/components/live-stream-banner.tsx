import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import i18n from '@/lib/i18n';
import { LiveStreamWithTimeRemaining } from '@/lib/types';

export default function LiveStreamBanner() {
  const { data: liveStream } = useQuery<LiveStreamWithTimeRemaining>({
    queryKey: ['/api/live-streams/active'],
    staleTime: 60000, // Refresh every minute
  });

  const [minutesRemaining, setMinutesRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!liveStream) return;
    
    // Calculate minutes remaining for countdown
    const calculateTimeRemaining = () => {
      if (!liveStream) return;
      
      const now = new Date();
      const startTime = new Date(liveStream.startTime);
      const timeDiff = startTime.getTime() - now.getTime();
      
      // If the stream has already started
      if (timeDiff <= 0) {
        setMinutesRemaining(0);
        return;
      }
      
      // Convert to minutes
      const minutes = Math.ceil(timeDiff / (1000 * 60));
      setMinutesRemaining(minutes);
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [liveStream]);
  
  // Don't show banner if there's no active stream
  if (!liveStream) return null;
  
  return (
    <div className="bg-accent-dark text-white px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2 pulse"></span>
        <span className="font-medium">
          {i18n.t('liveNow')} - {liveStream.title}
          {minutesRemaining && minutesRemaining > 0 ? (
            ` ${i18n.t('starting')} ${minutesRemaining} ${i18n.t('minutes')}`
          ) : ''}
        </span>
      </div>
      <Link to={`/live-stream`}>
        <a className="text-white bg-accent px-4 py-1 rounded-md text-sm hover:bg-accent-light transition">
          {i18n.t('watchNow')}
        </a>
      </Link>
    </div>
  );
}
