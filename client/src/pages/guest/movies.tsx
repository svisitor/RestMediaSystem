import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import GuestLayout from "@/components/layout/app-layout";
import MediaCard from "@/components/media-card";
import i18n from "@/lib/i18n";
import { MediaWithDetails } from "@/lib/types";
import { Category } from "@shared/schema";

export default function Movies() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories", { type: "movie" }],
  });

  const { data: movies, isLoading } = useQuery<MediaWithDetails[]>({
    queryKey: [
      "/api/media",
      {
        type: "movie",
        categoryId: selectedCategory,
        search: searchQuery,
      },
    ],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will be automatically refetched due to the queryKey change
  };

  return (
    <GuestLayout>
      <div className="px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">{i18n.t("movies")}</h1>

          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder={i18n.t("search")}
              className="w-full pr-10 rounded-md bg-surface border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>

        {/* Categories */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 space-x-reverse pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className={`${
                selectedCategory === null
                  ? "bg-secondary"
                  : "bg-surface hover:bg-surface-light"
              } px-4 py-2 rounded-md`}
              onClick={() => setSelectedCategory(null)}
            >
              {i18n.t("all")}
            </Button>

            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                className={`${
                  selectedCategory === category.id
                    ? "bg-secondary"
                    : "bg-surface hover:bg-surface-light"
                } px-4 py-2 rounded-md`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoading ? (
            // Loading skeleton
            Array(10)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-surface rounded-lg h-64"
                ></div>
              ))
          ) : movies && movies.length > 0 ? (
            movies.map((movie) => <MediaCard key={movie.id} media={movie} />)
          ) : (
            <div className="col-span-full text-center py-10 text-gray-400">
              لا توجد أفلام متطابقة مع البحث
            </div>
          )}
        </div>
      </div>
    </GuestLayout>
  );
}
