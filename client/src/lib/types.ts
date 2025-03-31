// Additional client-side types that extend the schema types

import { Media, SeriesSeason, SeriesEpisode, Category, VoteSuggestion, Advertisement as SchemaAdvertisement } from "@shared/schema";

// We redefine Advertisement instead of extending to avoid TypeScript errors
export interface Advertisement {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  priority: number;
  createdAt: Date;
}

export interface MediaWithDetails extends Media {
  category?: Category;
}

export interface SeriesWithDetails extends MediaWithDetails {
  seasons?: (SeriesSeason & {
    episodes?: SeriesEpisode[];
  })[];
}

export interface VoteSuggestionWithDetails extends VoteSuggestion {
  category?: Category;
  userDisplayName?: string;
}

export interface LiveStreamWithTimeRemaining {
  id: number;
  title: string;
  description: string;
  category: string;
  streamUrl: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  minutesRemaining?: number;
}

export interface AdminStats {
  totalContent: number;
  activeUsers: number;
  todaySuggestions: number;
  upcomingBroadcasts: number;
}

export interface User {
  id: number;
  username: string;
  displayName: string;
  role: string;
}
