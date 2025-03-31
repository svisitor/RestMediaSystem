import { useEffect } from "react";
import { Advertisement } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data: advertisements = [], isLoading, error } = useQuery<Advertisement[]>({
    queryKey: ['/api/advertisements/active'],
    enabled: true
  });

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
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
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