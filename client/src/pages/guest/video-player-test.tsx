import { useState } from 'react';
import { VideoPlayer } from '@/components/ui/video-player';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GuestLayout from '@/components/layout/guest-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample videos with various features for testing
const testVideos = [
  {
    id: 1,
    title: 'Big Buck Bunny (Sample)',
    description: 'Test double-tap to skip and long-press for speed',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    introEndTime: 28, // Sample intro length in seconds
  },
  {
    id: 2,
    title: 'Elephant Dream (Sample)',
    description: 'Test all advanced playback features',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    introEndTime: 15, // Sample intro length in seconds
  },
  {
    id: 3,
    title: 'Sintel (Sample)',
    description: 'Test with custom skip seconds',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    skipSeconds: 15,
    introEndTime: 20, // Sample intro length in seconds
  }
];

export default function VideoPlayerTest() {
  const [activeVideo, setActiveVideo] = useState(testVideos[0]);

  return (
    <GuestLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6 text-right">اختبار مشغل الفيديو المتقدم</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <VideoPlayer 
                src={activeVideo.src}
                title={activeVideo.title}
                poster={activeVideo.poster}
                introEndTime={activeVideo.introEndTime}
                skipSeconds={activeVideo.skipSeconds || 10}
                onDownload={() => alert('Download triggered for: ' + activeVideo.title)}
              />
            </CardContent>
          </Card>
          
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-right">{activeVideo.title}</h2>
            <p className="text-muted-foreground mb-6 text-right">{activeVideo.description}</p>
            
            <h3 className="text-xl font-semibold mb-3 text-right">تعليمات الاستخدام:</h3>
            <ul className="list-disc list-inside space-y-2 text-right">
              <li>اضغط نقرة مزدوجة على يمين الشاشة للتخطي للأمام {activeVideo.skipSeconds || 10} ثواني</li>
              <li>اضغط نقرة مزدوجة على يسار الشاشة للرجوع للخلف {activeVideo.skipSeconds || 10} ثواني</li>
              <li>اضغط ضغطة طويلة في وسط الشاشة لتسريع التشغيل</li>
              <li>اضغط على زر "تخطي المقدمة" لتخطي مقدمة الفيديو</li>
              <li>تأكد من تجربة زر سرعة التشغيل في شريط التحكم بالأسفل</li>
            </ul>
          </div>
          
          <Tabs defaultValue="1" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="1" onClick={() => setActiveVideo(testVideos[0])}>فيديو 1</TabsTrigger>
              <TabsTrigger value="2" onClick={() => setActiveVideo(testVideos[1])}>فيديو 2</TabsTrigger>
              <TabsTrigger value="3" onClick={() => setActiveVideo(testVideos[2])}>فيديو 3</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </GuestLayout>
  );
}