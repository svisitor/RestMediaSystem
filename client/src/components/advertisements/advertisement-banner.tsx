import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Advertisement } from "@/lib/types";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export interface AdvertisementBannerProps {
  className?: string;
  showTitle?: boolean;
}

export default function AdvertisementBanner({ 
  className = "",
  showTitle = true
}: AdvertisementBannerProps) {
  const { toast } = useToast();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const { data: advertisements = [], isLoading, error } = useQuery<Advertisement[]>({
    queryKey: ['/api/advertisements/active'],
    enabled: true
  });

  useEffect(() => {
    if (!advertisements || advertisements.length <= 1) return;

    // Rotate through ads every 8 seconds
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => 
        prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [advertisements]);

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
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div className="w-full aspect-[3/1] relative">
            <Skeleton className="w-full h-full absolute inset-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!advertisements || advertisements.length === 0) {
    return null;
  }

  const currentAd: Advertisement = advertisements[currentAdIndex];

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <Link to={currentAd.linkUrl || '#'}>
          <div className="w-full aspect-[3/1] relative overflow-hidden group">
            <img 
              src={currentAd.imageUrl} 
              alt={currentAd.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {showTitle && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                <h3 className="text-xl font-bold">{currentAd.title}</h3>
                {currentAd.description && (
                  <p className="text-sm mt-1 line-clamp-2">{currentAd.description}</p>
                )}
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}