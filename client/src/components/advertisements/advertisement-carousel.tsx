import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Advertisement } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface AdvertisementCarouselProps {
  className?: string;
  autoplay?: boolean;
  interval?: number;
  showControls?: boolean;
}

export default function AdvertisementCarousel({
  className = "",
  autoplay = true,
  interval = 5000,
  showControls = true,
}: AdvertisementCarouselProps) {
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const intervalRef = useRef<number | null>(null);

  const { data: advertisements = [], isLoading, error } = useQuery<Advertisement[]>({
    queryKey: ['/api/advertisements/active'],
    enabled: true
  });

  // Setup autoplay functionality
  useEffect(() => {
    if (api && autoplay && advertisements.length > 1) {
      // Clear any existing interval
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      
      // Set up new interval for autoplay
      intervalRef.current = window.setInterval(() => {
        api.scrollNext();
      }, interval);
      
      // Pause autoplay when user interacts with carousel
      const handleInteraction = () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          
          // Resume after a pause
          setTimeout(() => {
            if (intervalRef.current) return; // Don't set if already set
            intervalRef.current = window.setInterval(() => {
              api.scrollNext();
            }, interval);
          }, interval * 2);
        }
      };
      
      document.addEventListener('mousedown', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
      
      return () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
        document.removeEventListener('mousedown', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };
    }
  }, [api, autoplay, interval, advertisements]);

  useEffect(() => {
    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعلانات",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <Card>
          <CardContent className="p-0">
            <div className="w-full aspect-video">
              <Skeleton className="w-full h-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!advertisements || advertisements.length === 0) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-background/50", className)}>
        <div className="text-center p-8 max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">لا توجد إعلانات</h3>
          <p className="text-muted-foreground text-sm">
            لم يتم العثور على إعلانات نشطة. الرجاء إضافة إعلانات من لوحة التحكم.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
        setApi={setApi}
      >
        <CarouselContent>
          {advertisements.map((ad: Advertisement) => (
            <CarouselItem key={ad.id}>
              <div className="p-1">
                <Card className="overflow-hidden border-0 rounded-xl">
                  <CardContent className="p-0">
                    <Link to={ad.linkUrl || '#'}>
                      <div className="w-full aspect-[16/9] relative overflow-hidden group">
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4 px-4 text-white">
                          <h3 className="text-2xl font-bold mb-2">{ad.title}</h3>
                          {ad.description && (
                            <p className="text-sm mb-3 line-clamp-2">{ad.description}</p>
                          )}
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="mt-2"
                          >
                            عرض التفاصيل
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showControls && advertisements.length > 1 && (
          <>
            <CarouselPrevious className="ltr:-left-4 rtl:-right-4 focus:scale-110 hover:scale-110" />
            <CarouselNext className="ltr:-right-4 rtl:-left-4 focus:scale-110 hover:scale-110" />
          </>
        )}
      </Carousel>
    </div>
  );
}