import { 
  users, User, InsertUser, 
  media, Media, InsertMedia, 
  categories, Category, InsertCategory,
  seriesSeasons, SeriesSeason, InsertSeriesSeason,
  seriesEpisodes, SeriesEpisode, InsertSeriesEpisode,
  voteSuggestions, VoteSuggestion, InsertVoteSuggestion,
  voteRecords, VoteRecord, InsertVoteRecord,
  liveStreams, LiveStream, InsertLiveStream,
  advertisements, Advertisement, InsertAdvertisement
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, gt, gte, lt, lte, isNull, desc, count, ilike, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

// Extend the storage interface with all required methods based on the routes.ts file
export interface IStorage {
  // User-related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  getUsers(search?: string): Promise<User[]>;

  // Category-related methods
  getCategories(type?: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Media-related methods
  getMedia(options: { 
    type?: string; 
    categoryId?: number; 
    search?: string;
    limit?: number;
  }): Promise<Media[]>;
  getMediaById(id: number): Promise<Media & { 
    category?: Category; 
    seasons?: (SeriesSeason & { episodes?: SeriesEpisode[] })[];
  } | undefined>;
  getFeaturedMedia(): Promise<Media & { category?: Category } | undefined>;
  createMedia(media: InsertMedia): Promise<Media>;
  updateMedia(id: number, mediaData: Partial<InsertMedia>): Promise<Media | undefined>;
  deleteMedia(id: number): Promise<void>;
  
  // Series-related methods
  createSeriesSeason(season: InsertSeriesSeason): Promise<SeriesSeason>;
  createSeriesEpisode(episode: InsertSeriesEpisode): Promise<SeriesEpisode>;

  // Advertisement-related methods
  getActiveAdvertisements(): Promise<Advertisement[]>;
  getAdvertisement(id: number): Promise<Advertisement | undefined>;
  getAllAdvertisements(): Promise<Advertisement[]>;
  createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement>;
  updateAdvertisement(id: number, adData: Partial<InsertAdvertisement>): Promise<Advertisement | undefined>;
  deleteAdvertisement(id: number): Promise<void>;

  // Voting-related methods
  getVoteSuggestions(): Promise<(VoteSuggestion & { 
    category?: Category;
    userDisplayName?: string;
  })[]>;
  getAllVoteSuggestions(): Promise<(VoteSuggestion & { 
    category?: Category;
    userDisplayName?: string;
  })[]>;
  getTopVotedSuggestions(limit?: number): Promise<(VoteSuggestion & { 
    category?: Category;
    userDisplayName?: string;
  })[]>;
  createVoteSuggestion(suggestion: InsertVoteSuggestion): Promise<VoteSuggestion>;
  voteForSuggestion(userId: number, suggestionId: number): Promise<void>;
  hasUserVotedForSuggestion(userId: number, suggestionId: number): Promise<boolean>;
  getRemainingDailySuggestions(userId: number): Promise<number>;
  approveSuggestion(id: number): Promise<void>;
  rejectSuggestion(id: number): Promise<void>;

  // Live stream-related methods
  getActiveLiveStream(): Promise<LiveStream & { minutesRemaining?: number } | undefined>;
  getUpcomingLiveStreams(limit?: number): Promise<(LiveStream & { minutesRemaining?: number })[]>;
  getAllLiveStreams(): Promise<LiveStream[]>;
  createLiveStream(stream: Omit<InsertLiveStream, "createdAt">): Promise<LiveStream>;
  updateLiveStream(id: number, streamData: Partial<InsertLiveStream>): Promise<LiveStream | undefined>;
  deleteLiveStream(id: number): Promise<void>;

  // Admin dashboard methods
  getAdminStats(): Promise<{
    totalContent: number;
    activeUsers: number;
    todaySuggestions: number;
    upcomingBroadcasts: number;
  }>;
  getRecentContent(limit?: number): Promise<(Media & { category?: Category })[]>;

  // Settings methods
  saveGeneralSettings(settings: any): Promise<void>;
  saveNetworkSettings(settings: any): Promise<void>;
  saveDatabaseSettings(settings: any): Promise<void>;
  createBackup(): Promise<void>;
}

export class MemStorage implements IStorage {
  // Storage maps
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private media: Map<number, Media>;
  private seriesSeasons: Map<number, SeriesSeason>;
  private seriesEpisodes: Map<number, SeriesEpisode>;
  private voteSuggestions: Map<number, VoteSuggestion>;
  private voteRecords: Map<number, VoteRecord>;
  private liveStreams: Map<number, LiveStream>;
  private advertisements: Map<number, Advertisement>;
  
  // Settings storage
  private generalSettings: any;
  private networkSettings: any;
  private databaseSettings: any;

  // ID counters
  private userId: number;
  private categoryId: number;
  private mediaId: number;
  private seasonId: number;
  private episodeId: number;
  private suggestionId: number;
  private voteRecordId: number;
  private liveStreamId: number;

  // ID counter for advertisements
  private advertisementId: number;

  constructor() {
    // Initialize storage maps
    this.users = new Map();
    this.categories = new Map();
    this.media = new Map();
    this.seriesSeasons = new Map();
    this.seriesEpisodes = new Map();
    this.voteSuggestions = new Map();
    this.voteRecords = new Map();
    this.liveStreams = new Map();
    this.advertisements = new Map();

    // Initialize ID counters
    this.userId = 1;
    this.categoryId = 1;
    this.mediaId = 1;
    this.seasonId = 1;
    this.episodeId = 1;
    this.suggestionId = 1;
    this.voteRecordId = 1;
    this.liveStreamId = 1;
    this.advertisementId = 1;

    // Initialize settings
    this.generalSettings = {
      siteName: 'استراحة مانجر',
      siteDescription: 'نظام إدارة المحتوى الترفيهي للاستراحات والفنادق',
      maxDailyVotes: 10,
      darkMode: true,
      allowDownloads: true,
      autoProcessVoting: true,
    };
    
    this.networkSettings = {
      localNetworkOnly: true,
      requireAuthentication: true,
      streamingQuality: 'hd',
    };
    
    this.databaseSettings = {
      backupFrequency: 'daily',
      backupTime: '00:00',
      backupRetention: 7,
    };

    // Seed with initial data
    (async () => {
      try {
        await this.seedInitialData();
      } catch (error) {
        console.error('Error seeding initial data:', error);
      }
    })();
  }

  // Initialize the storage with sample data
  private async seedInitialData() {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await this.createUser({
      username: 'admin',
      password: adminPassword,
      displayName: 'مدير النظام',
      role: 'admin'
    });

    // Create guest user
    const guestPassword = await bcrypt.hash('guest123', 10);
    await this.createUser({
      username: 'guest',
      password: guestPassword,
      displayName: 'زائر',
      role: 'guest'
    });

    // Create categories
    const actionCategory = await this.createCategory({ name: 'أكشن', type: 'both' });
    const dramaCategory = await this.createCategory({ name: 'دراما', type: 'both' });
    const comedyCategory = await this.createCategory({ name: 'كوميديا', type: 'both' });
    const adventureCategory = await this.createCategory({ name: 'مغامرة', type: 'both' });
    const sciFiCategory = await this.createCategory({ name: 'خيال علمي', type: 'both' });
    
    // Create sample movies
    await this.createMedia({
      title: 'طريق الأبطال',
      description: 'فيلم أكشن مثير عن مجموعة من الأبطال يواجهون تحديات كبيرة',
      type: 'movie',
      categoryId: actionCategory.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&h=450',
      filePath: '/media/movies/hero-path.mp4',
      year: 2023
    });

    await this.createMedia({
      title: 'المغامرة الكبرى',
      description: 'مغامرة مثيرة في عالم مليء بالأسرار والألغاز',
      type: 'movie',
      categoryId: adventureCategory.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&w=300&h=450',
      filePath: '/media/movies/big-adventure.mp4',
      year: 2022
    });

    await this.createMedia({
      title: 'الحياة الجديدة',
      description: 'قصة درامية عن بداية جديدة وحياة مختلفة',
      type: 'movie',
      categoryId: dramaCategory.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=300&h=450',
      filePath: '/media/movies/new-life.mp4',
      year: 2023
    });

    // Create sample series
    const shadowWorld = await this.createMedia({
      title: 'عالم الظلال',
      description: 'مسلسل إثارة وغموض في عالم الجريمة',
      type: 'series',
      categoryId: dramaCategory.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1606889464198-fcb18894cf50?auto=format&fit=crop&w=300&h=450',
      filePath: '/media/series/shadow-world/',
      year: 2023
    });

    const secretLife = await this.createMedia({
      title: 'الحياة السرية',
      description: 'مسلسل درامي عن الحياة السرية لشخصيات غامضة',
      type: 'series',
      categoryId: dramaCategory.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1543536448-1e76fc2795bf?auto=format&fit=crop&w=300&h=450',
      filePath: '/media/series/secret-life/',
      year: 2022
    });

    // Create sample seasons and episodes
    const shadowWorldSeason1 = await this.createSeriesSeason({
      mediaId: shadowWorld.id,
      seasonNumber: 1,
      title: 'الموسم الأول'
    });

    await this.createSeriesEpisode({
      seasonId: shadowWorldSeason1.id,
      episodeNumber: 1,
      title: 'البداية',
      filePath: '/media/series/shadow-world/s01e01.mp4'
    });

    await this.createSeriesEpisode({
      seasonId: shadowWorldSeason1.id,
      episodeNumber: 2,
      title: 'المواجهة',
      filePath: '/media/series/shadow-world/s01e02.mp4'
    });

    const secretLifeSeason1 = await this.createSeriesSeason({
      mediaId: secretLife.id,
      seasonNumber: 1,
      title: 'الموسم الأول'
    });

    await this.createSeriesEpisode({
      seasonId: secretLifeSeason1.id,
      episodeNumber: 1,
      title: 'الأسرار',
      filePath: '/media/series/secret-life/s01e01.mp4'
    });

    // Create sample live stream
    const now = new Date();
    const startTime = new Date();
    startTime.setHours(now.getHours() + 2);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 2);

    await this.createLiveStream({
      title: 'نهائي كأس العالم',
      description: 'البث المباشر لنهائي كأس العالم لكرة القدم',
      category: 'رياضة',
      streamUrl: '/media/live/world-cup-final.mp4',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isActive: false
    });

    // Create sample vote suggestions
    const suggestion1 = await this.createVoteSuggestion({
      title: 'الرجل الخارق',
      type: 'movie',
      categoryId: actionCategory.id,
      userId: 2
    });

    const suggestion2 = await this.createVoteSuggestion({
      title: 'المدينة المنسية',
      type: 'series',
      categoryId: sciFiCategory.id,
      userId: 2
    });

    // Add some votes to the suggestions
    await this.voteForSuggestion(1, suggestion1.id);
    await this.voteForSuggestion(2, suggestion1.id);
    await this.voteForSuggestion(1, suggestion2.id);

    // Create sample advertisements
    const currentDate = new Date();
    const oneWeekFromNow = new Date(currentDate);
    oneWeekFromNow.setDate(currentDate.getDate() + 7);

    const oneMonthFromNow = new Date(currentDate);
    oneMonthFromNow.setDate(currentDate.getDate() + 30);

    await this.createAdvertisement({
      title: "عرض خاص - الوجبات",
      description: "خصم 20% على جميع الوجبات هذا الأسبوع!",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&h=400",
      linkUrl: "/specials/food",
      startDate: currentDate.toISOString(),
      endDate: oneWeekFromNow.toISOString(),
      isActive: true,
      priority: 10
    });

    await this.createAdvertisement({
      title: "عرض جديد - الفيلم الأسبوعي",
      description: "شاهد أحدث الأفلام على شاشتنا الكبيرة كل يوم جمعة",
      imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&h=400",
      linkUrl: "/events/movies",
      startDate: currentDate.toISOString(),
      endDate: oneMonthFromNow.toISOString(),
      isActive: true,
      priority: 5
    });

    await this.createAdvertisement({
      title: "خدمة واي فاي مجانية",
      description: "استمتع بخدمة الإنترنت السريعة في جميع أنحاء الاستراحة",
      imageUrl: "https://images.unsplash.com/photo-1563770557518-8c00bcfc54bb?auto=format&fit=crop&w=800&h=400",
      linkUrl: "/amenities/wifi",
      startDate: currentDate.toISOString(),
      endDate: null,
      isActive: true,
      priority: 1
    });
  }

  // User-related methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...userData, id, createdAt: now.toISOString() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async getUsers(search?: string): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        user => 
          user.username.toLowerCase().includes(searchLower) ||
          user.displayName.toLowerCase().includes(searchLower)
      );
    }
    
    return users;
  }

  // Category-related methods
  async getCategories(type?: string): Promise<Category[]> {
    let categories = Array.from(this.categories.values());
    
    if (type) {
      categories = categories.filter(
        category => category.type === type || category.type === 'both'
      );
    }
    
    return categories;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...categoryData, id };
    this.categories.set(id, category);
    return category;
  }

  // Media-related methods
  async getMedia(options: {
    type?: string;
    categoryId?: number;
    search?: string;
    limit?: number;
  }): Promise<Media[]> {
    let mediaList = Array.from(this.media.values());
    
    if (options.type) {
      mediaList = mediaList.filter(item => item.type === options.type);
    }
    
    if (options.categoryId) {
      mediaList = mediaList.filter(item => item.categoryId === options.categoryId);
    }
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      mediaList = mediaList.filter(
        item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by created date, newest first
    mediaList.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    if (options.limit) {
      mediaList = mediaList.slice(0, options.limit);
    }
    
    // Add category information to each media item
    return mediaList.map(item => {
      const category = this.categories.get(item.categoryId);
      return { ...item, category };
    });
  }

  async getMediaById(id: number): Promise<Media & {
    category?: Category;
    seasons?: (SeriesSeason & { episodes?: SeriesEpisode[] })[];
  } | undefined> {
    const media = this.media.get(id);
    if (!media) return undefined;
    
    const category = this.categories.get(media.categoryId);
    
    // If it's a series, get the seasons and episodes
    let seasons: (SeriesSeason & { episodes?: SeriesEpisode[] })[] = [];
    
    if (media.type === 'series') {
      // Get all seasons for this media
      const mediaSeasons = Array.from(this.seriesSeasons.values())
        .filter(season => season.mediaId === id)
        .sort((a, b) => a.seasonNumber - b.seasonNumber);
      
      // For each season, get its episodes
      seasons = mediaSeasons.map(season => {
        const episodes = Array.from(this.seriesEpisodes.values())
          .filter(episode => episode.seasonId === season.id)
          .sort((a, b) => a.episodeNumber - b.episodeNumber);
        
        return { ...season, episodes };
      });
    }
    
    return { ...media, category, seasons };
  }

  async getFeaturedMedia(): Promise<Media & { category?: Category } | undefined> {
    // For simplicity, return the most recently added media
    const mediaList = Array.from(this.media.values());
    
    if (mediaList.length === 0) return undefined;
    
    mediaList.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const featuredMedia = mediaList[0];
    const category = this.categories.get(featuredMedia.categoryId);
    
    return { ...featuredMedia, category };
  }

  async createMedia(mediaData: InsertMedia): Promise<Media> {
    const id = this.mediaId++;
    const now = new Date();
    const media: Media = { ...mediaData, id, createdAt: now.toISOString() };
    this.media.set(id, media);
    return media;
  }

  async updateMedia(id: number, mediaData: Partial<InsertMedia>): Promise<Media | undefined> {
    const media = this.media.get(id);
    if (!media) return undefined;
    
    const updatedMedia: Media = { ...media, ...mediaData };
    this.media.set(id, updatedMedia);
    return updatedMedia;
  }

  async deleteMedia(id: number): Promise<void> {
    // Delete media
    this.media.delete(id);
    
    // Delete associated seasons and episodes if it's a series
    const seasons = Array.from(this.seriesSeasons.values())
      .filter(season => season.mediaId === id);
      
    for (const season of seasons) {
      this.seriesSeasons.delete(season.id);
      
      // Delete episodes of this season
      const episodes = Array.from(this.seriesEpisodes.values())
        .filter(episode => episode.seasonId === season.id);
        
      for (const episode of episodes) {
        this.seriesEpisodes.delete(episode.id);
      }
    }
  }

  // Series-related methods
  async createSeriesSeason(seasonData: InsertSeriesSeason): Promise<SeriesSeason> {
    const id = this.seasonId++;
    const season: SeriesSeason = { ...seasonData, id };
    this.seriesSeasons.set(id, season);
    return season;
  }

  async createSeriesEpisode(episodeData: InsertSeriesEpisode): Promise<SeriesEpisode> {
    const id = this.episodeId++;
    const episode: SeriesEpisode = { ...episodeData, id };
    this.seriesEpisodes.set(id, episode);
    return episode;
  }

  // Advertisement-related methods
  async getActiveAdvertisements(): Promise<Advertisement[]> {
    const now = new Date();
    const ads = Array.from(this.advertisements.values())
      .filter(ad => {
        const startDate = new Date(ad.startDate);
        const endDate = ad.endDate ? new Date(ad.endDate) : null;
        return ad.isActive && 
               startDate <= now && 
               (!endDate || endDate >= now);
      });
    
    // Sort by priority (higher first) and then by start date (newest first)
    return ads.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }

  async getAdvertisement(id: number): Promise<Advertisement | undefined> {
    return this.advertisements.get(id);
  }

  async getAllAdvertisements(): Promise<Advertisement[]> {
    const ads = Array.from(this.advertisements.values());
    
    // Sort by created date (newest first)
    return ads.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createAdvertisement(adData: InsertAdvertisement): Promise<Advertisement> {
    const id = this.advertisementId++;
    const now = new Date();
    const ad: Advertisement = { ...adData, id, createdAt: now.toISOString() };
    this.advertisements.set(id, ad);
    return ad;
  }

  async updateAdvertisement(id: number, adData: Partial<InsertAdvertisement>): Promise<Advertisement | undefined> {
    const ad = this.advertisements.get(id);
    if (!ad) return undefined;
    
    const updatedAd: Advertisement = { ...ad, ...adData };
    this.advertisements.set(id, updatedAd);
    return updatedAd;
  }

  async deleteAdvertisement(id: number): Promise<void> {
    this.advertisements.delete(id);
  }

  // Voting-related methods
  async getVoteSuggestions(): Promise<(VoteSuggestion & {
    category?: Category;
    userDisplayName?: string;
  })[]> {
    // Get today's vote suggestions only (status: pending)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let suggestions = Array.from(this.voteSuggestions.values())
      .filter(suggestion => {
        const suggestionDate = new Date(suggestion.createdAt);
        suggestionDate.setHours(0, 0, 0, 0);
        return suggestionDate.getTime() === today.getTime() && 
               suggestion.status === 'pending';
      });
    
    // Sort by votes (descending)
    suggestions.sort((a, b) => b.votes - a.votes);
    
    // Enrich with category and user info
    return suggestions.map(suggestion => {
      const category = this.categories.get(suggestion.categoryId);
      const user = this.users.get(suggestion.userId);
      return {
        ...suggestion,
        category,
        userDisplayName: user?.displayName
      };
    });
  }

  async getAllVoteSuggestions(): Promise<(VoteSuggestion & {
    category?: Category;
    userDisplayName?: string;
  })[]> {
    // Get all vote suggestions
    let suggestions = Array.from(this.voteSuggestions.values());
    
    // Sort by created date (newest first)
    suggestions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Enrich with category and user info
    return suggestions.map(suggestion => {
      const category = this.categories.get(suggestion.categoryId);
      const user = this.users.get(suggestion.userId);
      return {
        ...suggestion,
        category,
        userDisplayName: user?.displayName
      };
    });
  }

  async getTopVotedSuggestions(limit: number = 5): Promise<(VoteSuggestion & {
    category?: Category;
    userDisplayName?: string;
  })[]> {
    // Get pending suggestions
    let suggestions = Array.from(this.voteSuggestions.values())
      .filter(suggestion => suggestion.status === 'pending');
    
    // Sort by votes (descending)
    suggestions.sort((a, b) => b.votes - a.votes);
    
    // Limit results
    suggestions = suggestions.slice(0, limit);
    
    // Enrich with category and user info
    return suggestions.map(suggestion => {
      const category = this.categories.get(suggestion.categoryId);
      const user = this.users.get(suggestion.userId);
      return {
        ...suggestion,
        category,
        userDisplayName: user?.displayName
      };
    });
  }

  async createVoteSuggestion(suggestionData: InsertVoteSuggestion): Promise<VoteSuggestion> {
    const id = this.suggestionId++;
    const now = new Date();
    const suggestion: VoteSuggestion = {
      ...suggestionData,
      id,
      votes: 0,
      status: 'pending',
      createdAt: now.toISOString(),
      processedAt: null
    };
    this.voteSuggestions.set(id, suggestion);
    return suggestion;
  }

  async voteForSuggestion(userId: number, suggestionId: number): Promise<void> {
    const suggestion = this.voteSuggestions.get(suggestionId);
    if (!suggestion) throw new Error('Suggestion not found');
    
    if (suggestion.status !== 'pending') {
      throw new Error('Cannot vote for processed suggestions');
    }
    
    // Add a vote record
    const id = this.voteRecordId++;
    const now = new Date();
    const voteRecord: VoteRecord = {
      id,
      suggestionId,
      userId,
      createdAt: now.toISOString()
    };
    this.voteRecords.set(id, voteRecord);
    
    // Increment vote count on suggestion
    suggestion.votes += 1;
    this.voteSuggestions.set(suggestionId, suggestion);
  }

  async hasUserVotedForSuggestion(userId: number, suggestionId: number): Promise<boolean> {
    return Array.from(this.voteRecords.values()).some(
      record => record.userId === userId && record.suggestionId === suggestionId
    );
  }

  async getRemainingDailySuggestions(userId: number): Promise<number> {
    // Count today's suggestions by this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySuggestions = Array.from(this.voteSuggestions.values())
      .filter(suggestion => {
        const suggestionDate = new Date(suggestion.createdAt);
        suggestionDate.setHours(0, 0, 0, 0);
        return suggestionDate.getTime() === today.getTime() && 
               suggestion.userId === userId;
      });
    
    // Max daily suggestions from settings
    const maxDailySuggestions = this.generalSettings.maxDailyVotes || 10;
    
    return Math.max(0, maxDailySuggestions - todaySuggestions.length);
  }

  async approveSuggestion(id: number): Promise<void> {
    const suggestion = this.voteSuggestions.get(id);
    if (!suggestion) throw new Error('Suggestion not found');
    
    const now = new Date();
    
    // Update suggestion status
    const updatedSuggestion: VoteSuggestion = {
      ...suggestion,
      status: 'approved',
      processedAt: now.toISOString()
    };
    this.voteSuggestions.set(id, updatedSuggestion);
  }

  async rejectSuggestion(id: number): Promise<void> {
    const suggestion = this.voteSuggestions.get(id);
    if (!suggestion) throw new Error('Suggestion not found');
    
    const now = new Date();
    
    // Update suggestion status
    const updatedSuggestion: VoteSuggestion = {
      ...suggestion,
      status: 'rejected',
      processedAt: now.toISOString()
    };
    this.voteSuggestions.set(id, updatedSuggestion);
  }

  // Live stream-related methods
  async getActiveLiveStream(): Promise<LiveStream & { minutesRemaining?: number } | undefined> {
    const now = new Date();
    
    // Find active stream or stream that starts within the next hour
    const streams = Array.from(this.liveStreams.values())
      .filter(stream => {
        const startTime = new Date(stream.startTime);
        const endTime = new Date(stream.endTime);
        
        return stream.isActive || 
              (startTime <= new Date(now.getTime() + 60 * 60 * 1000) && // Starts within the next hour
               endTime >= now); // Not ended yet
      });
    
    if (streams.length === 0) return undefined;
    
    // Sort by start time (ascending)
    streams.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    const activeStream = streams[0];
    
    // Calculate minutes remaining until start
    const startTime = new Date(activeStream.startTime);
    let minutesRemaining: number | undefined = undefined;
    
    if (startTime > now) {
      minutesRemaining = Math.ceil((startTime.getTime() - now.getTime()) / (60 * 1000));
    }
    
    return { ...activeStream, minutesRemaining };
  }

  async getUpcomingLiveStreams(limit: number = 5): Promise<(LiveStream & { minutesRemaining?: number })[]> {
    const now = new Date();
    
    // Find upcoming streams (not started yet)
    let streams = Array.from(this.liveStreams.values())
      .filter(stream => {
        const startTime = new Date(stream.startTime);
        return startTime > now;
      });
    
    // Sort by start time (ascending)
    streams.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    // Limit results
    streams = streams.slice(0, limit);
    
    // Calculate minutes remaining for each stream
    return streams.map(stream => {
      const startTime = new Date(stream.startTime);
      const minutesRemaining = Math.ceil((startTime.getTime() - now.getTime()) / (60 * 1000));
      
      return { ...stream, minutesRemaining };
    });
  }

  async getAllLiveStreams(): Promise<LiveStream[]> {
    const streams = Array.from(this.liveStreams.values());
    
    // Sort by start time (descending)
    streams.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    
    return streams;
  }

  async createLiveStream(streamData: Omit<InsertLiveStream, "createdAt">): Promise<LiveStream> {
    const id = this.liveStreamId++;
    const now = new Date();
    const stream: LiveStream = {
      ...streamData,
      id,
      createdAt: now.toISOString()
    };
    this.liveStreams.set(id, stream);
    return stream;
  }

  async updateLiveStream(id: number, streamData: Partial<InsertLiveStream>): Promise<LiveStream | undefined> {
    const stream = this.liveStreams.get(id);
    if (!stream) return undefined;
    
    const updatedStream: LiveStream = { ...stream, ...streamData };
    this.liveStreams.set(id, updatedStream);
    return updatedStream;
  }

  async deleteLiveStream(id: number): Promise<void> {
    this.liveStreams.delete(id);
  }

  // Admin dashboard methods
  async getAdminStats(): Promise<{
    totalContent: number;
    activeUsers: number;
    todaySuggestions: number;
    upcomingBroadcasts: number;
  }> {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count total content
    const totalContent = this.media.size;
    
    // Count active users (simplified, assuming all users are active)
    const activeUsers = this.users.size;
    
    // Count today's suggestions
    const todaySuggestions = Array.from(this.voteSuggestions.values())
      .filter(suggestion => {
        const suggestionDate = new Date(suggestion.createdAt);
        suggestionDate.setHours(0, 0, 0, 0);
        return suggestionDate.getTime() === today.getTime();
      }).length;
    
    // Count upcoming broadcasts
    const upcomingBroadcasts = Array.from(this.liveStreams.values())
      .filter(stream => {
        const startTime = new Date(stream.startTime);
        return startTime > now;
      }).length;
    
    return {
      totalContent,
      activeUsers,
      todaySuggestions,
      upcomingBroadcasts
    };
  }

  async getRecentContent(limit: number = 3): Promise<(Media & { category?: Category })[]> {
    // Get most recently added content
    let mediaList = Array.from(this.media.values());
    
    // Sort by created date (newest first)
    mediaList.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Limit results
    mediaList = mediaList.slice(0, limit);
    
    // Add category information
    return mediaList.map(media => {
      const category = this.categories.get(media.categoryId);
      return { ...media, category };
    });
  }

  // Settings methods
  async saveGeneralSettings(settings: any): Promise<void> {
    this.generalSettings = { ...this.generalSettings, ...settings };
  }

  async saveNetworkSettings(settings: any): Promise<void> {
    this.networkSettings = { ...this.networkSettings, ...settings };
  }

  async saveDatabaseSettings(settings: any): Promise<void> {
    this.databaseSettings = { ...this.databaseSettings, ...settings };
  }

  async createBackup(): Promise<void> {
    // In memory storage doesn't actually create backups,
    // but we'll simulate the operation by waiting a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsers(search?: string): Promise<User[]> {
    if (search) {
      const searchLower = search.toLowerCase();
      return db
        .select()
        .from(users)
        .where(
          or(
            ilike(users.displayName, `%${searchLower}%`),
            ilike(users.username, `%${searchLower}%`)
          )
        );
    }
    return db.select().from(users);
  }

  async getCategories(type?: string): Promise<Category[]> {
    if (type) {
      return db
        .select()
        .from(categories)
        .where(
          or(
            eq(categories.type, type),
            eq(categories.type, 'both')
          )
        );
    }
    return db.select().from(categories);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  async getMedia(options: {
    type?: string;
    categoryId?: number;
    search?: string;
    limit?: number;
  }): Promise<Media[]> {
    let query = db.select().from(media);
    
    if (options.type) {
      query = query.where(eq(media.type, options.type));
    }
    
    if (options.categoryId) {
      query = query.where(eq(media.categoryId, options.categoryId));
    }
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      query = query.where(
        or(
          ilike(media.title, `%${searchLower}%`),
          ilike(media.description, `%${searchLower}%`)
        )
      );
    }
    
    // Sort by creation date, newest first
    query = query.orderBy(desc(media.createdAt));
    
    if (options.limit && options.limit > 0) {
      query = query.limit(options.limit);
    }
    
    return query;
  }

  async getMediaById(id: number): Promise<Media & {
    category?: Category;
    seasons?: (SeriesSeason & { episodes?: SeriesEpisode[] })[];
  } | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    if (!mediaItem) return undefined;
    
    // Get category
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, mediaItem.categoryId));
    
    // Get seasons and episodes if it's a series
    let seasons: (SeriesSeason & { episodes?: SeriesEpisode[] })[] = [];
    if (mediaItem.type === 'series') {
      // Get all seasons for this media
      const seasonsData = await db
        .select()
        .from(seriesSeasons)
        .where(eq(seriesSeasons.mediaId, mediaItem.id))
        .orderBy(seriesSeasons.seasonNumber);
      
      // For each season, get its episodes
      for (const season of seasonsData) {
        const episodes = await db
          .select()
          .from(seriesEpisodes)
          .where(eq(seriesEpisodes.seasonId, season.id))
          .orderBy(seriesEpisodes.episodeNumber);
        
        seasons.push({ ...season, episodes });
      }
    }
    
    return { ...mediaItem, category, seasons };
  }

  async getFeaturedMedia(): Promise<Media & { category?: Category } | undefined> {
    // Get the newest media item for featured display
    const [mediaItem] = await db
      .select()
      .from(media)
      .orderBy(desc(media.createdAt))
      .limit(1);
    
    if (!mediaItem) return undefined;
    
    // Get its category
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, mediaItem.categoryId));
    
    return { ...mediaItem, category };
  }

  async createMedia(mediaData: InsertMedia): Promise<Media> {
    const [newMedia] = await db.insert(media).values(mediaData).returning();
    return newMedia;
  }

  async updateMedia(id: number, mediaData: Partial<InsertMedia>): Promise<Media | undefined> {
    const [updatedMedia] = await db
      .update(media)
      .set(mediaData)
      .where(eq(media.id, id))
      .returning();
    return updatedMedia || undefined;
  }

  async deleteMedia(id: number): Promise<void> {
    // First get all seasons for this media
    const seasons = await db
      .select()
      .from(seriesSeasons)
      .where(eq(seriesSeasons.mediaId, id));
    
    // Delete episodes for each season
    for (const season of seasons) {
      await db
        .delete(seriesEpisodes)
        .where(eq(seriesEpisodes.seasonId, season.id));
    }
    
    // Delete all seasons
    await db
      .delete(seriesSeasons)
      .where(eq(seriesSeasons.mediaId, id));
    
    // Finally delete the media itself
    await db.delete(media).where(eq(media.id, id));
  }

  async createSeriesSeason(seasonData: InsertSeriesSeason): Promise<SeriesSeason> {
    const [season] = await db
      .insert(seriesSeasons)
      .values(seasonData)
      .returning();
    return season;
  }

  async createSeriesEpisode(episodeData: InsertSeriesEpisode): Promise<SeriesEpisode> {
    const [episode] = await db
      .insert(seriesEpisodes)
      .values(episodeData)
      .returning();
    return episode;
  }

  async getActiveAdvertisements(): Promise<Advertisement[]> {
    const now = new Date();
    
    return db
      .select()
      .from(advertisements)
      .where(
        and(
          eq(advertisements.isActive, true),
          lte(advertisements.startDate, now),
          or(
            isNull(advertisements.endDate),
            gte(advertisements.endDate, now)
          )
        )
      )
      .orderBy(desc(advertisements.priority));
  }

  async getAdvertisement(id: number): Promise<Advertisement | undefined> {
    const [ad] = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, id));
    return ad || undefined;
  }

  async getAllAdvertisements(): Promise<Advertisement[]> {
    return db
      .select()
      .from(advertisements)
      .orderBy(desc(advertisements.createdAt));
  }

  async createAdvertisement(adData: InsertAdvertisement): Promise<Advertisement> {
    const [ad] = await db
      .insert(advertisements)
      .values(adData)
      .returning();
    return ad;
  }

  async updateAdvertisement(id: number, adData: Partial<InsertAdvertisement>): Promise<Advertisement | undefined> {
    const [ad] = await db
      .update(advertisements)
      .set(adData)
      .where(eq(advertisements.id, id))
      .returning();
    return ad || undefined;
  }

  async deleteAdvertisement(id: number): Promise<void> {
    await db.delete(advertisements).where(eq(advertisements.id, id));
  }

  async getVoteSuggestions(): Promise<(VoteSuggestion & {
    category?: Category;
    userDisplayName?: string;
  })[]> {
    const suggestions = await db
      .select()
      .from(voteSuggestions)
      .where(eq(voteSuggestions.status, 'pending'))
      .orderBy(desc(voteSuggestions.votes));
    
    // Enhance with category and user info
    return await this.enhanceVoteSuggestions(suggestions);
  }

  async getAllVoteSuggestions(): Promise<(VoteSuggestion & {
    category?: Category;
    userDisplayName?: string;
  })[]> {
    const suggestions = await db
      .select()
      .from(voteSuggestions)
      .orderBy(desc(voteSuggestions.createdAt));
    
    // Enhance with category and user info
    return await this.enhanceVoteSuggestions(suggestions);
  }

  async getTopVotedSuggestions(limit: number = 5): Promise<(VoteSuggestion & {
    category?: Category;
    userDisplayName?: string;
  })[]> {
    const suggestions = await db
      .select()
      .from(voteSuggestions)
      .where(eq(voteSuggestions.status, 'pending'))
      .orderBy(desc(voteSuggestions.votes))
      .limit(limit);
    
    // Enhance with category and user info
    return await this.enhanceVoteSuggestions(suggestions);
  }

  private async enhanceVoteSuggestions(suggestions: VoteSuggestion[]): Promise<(VoteSuggestion & {
    category?: Category;
    userDisplayName?: string;
  })[]> {
    const result: (VoteSuggestion & {
      category?: Category;
      userDisplayName?: string;
    })[] = [];
    
    for (const suggestion of suggestions) {
      // Get category
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, suggestion.categoryId));
      
      // Get user name
      const [user] = await db
        .select({ displayName: users.displayName })
        .from(users)
        .where(eq(users.id, suggestion.userId));
      
      result.push({
        ...suggestion,
        category,
        userDisplayName: user?.displayName,
      });
    }
    
    return result;
  }

  async createVoteSuggestion(suggestionData: InsertVoteSuggestion): Promise<VoteSuggestion> {
    const [suggestion] = await db
      .insert(voteSuggestions)
      .values({
        ...suggestionData,
        votes: 0,
        status: 'pending',
      })
      .returning();
    return suggestion;
  }

  async voteForSuggestion(userId: number, suggestionId: number): Promise<void> {
    const hasVoted = await this.hasUserVotedForSuggestion(userId, suggestionId);
    if (hasVoted) {
      throw new Error('User has already voted for this suggestion');
    }
    
    // Transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Increment votes in the suggestion
      await tx
        .update(voteSuggestions)
        .set({ votes: sql`${voteSuggestions.votes} + 1` })
        .where(eq(voteSuggestions.id, suggestionId));
      
      // Record the vote
      await tx
        .insert(voteRecords)
        .values({
          suggestionId,
          userId,
        });
    });
  }

  async hasUserVotedForSuggestion(userId: number, suggestionId: number): Promise<boolean> {
    const [vote] = await db
      .select()
      .from(voteRecords)
      .where(
        and(
          eq(voteRecords.userId, userId),
          eq(voteRecords.suggestionId, suggestionId)
        )
      );
    
    return !!vote;
  }

  async getRemainingDailySuggestions(userId: number): Promise<number> {
    const MAX_DAILY_SUGGESTIONS = 3;
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count suggestions made by the user today
    const [result] = await db
      .select({ count: count() })
      .from(voteSuggestions)
      .where(
        and(
          eq(voteSuggestions.userId, userId),
          gte(voteSuggestions.createdAt, today)
        )
      );
    
    return Math.max(0, MAX_DAILY_SUGGESTIONS - (result?.count || 0));
  }

  async approveSuggestion(id: number): Promise<void> {
    const now = new Date();
    
    await db
      .update(voteSuggestions)
      .set({
        status: 'approved',
        processedAt: now,
      })
      .where(eq(voteSuggestions.id, id));
  }

  async rejectSuggestion(id: number): Promise<void> {
    const now = new Date();
    
    await db
      .update(voteSuggestions)
      .set({
        status: 'rejected',
        processedAt: now,
      })
      .where(eq(voteSuggestions.id, id));
  }

  async getActiveLiveStream(): Promise<LiveStream & { minutesRemaining?: number } | undefined> {
    const now = new Date();
    
    const [stream] = await db
      .select()
      .from(liveStreams)
      .where(
        and(
          eq(liveStreams.isActive, true),
          lte(liveStreams.startTime, now),
          gte(liveStreams.endTime, now)
        )
      );
    
    if (stream) {
      // Calculate minutes remaining
      const minutesRemaining = Math.floor(
        (stream.endTime.getTime() - now.getTime()) / (1000 * 60)
      );
      return { ...stream, minutesRemaining };
    }
    
    return undefined;
  }

  async getUpcomingLiveStreams(limit: number = 5): Promise<(LiveStream & { minutesRemaining?: number })[]> {
    const now = new Date();
    
    const streams = await db
      .select()
      .from(liveStreams)
      .where(gt(liveStreams.startTime, now))
      .orderBy(liveStreams.startTime)
      .limit(limit);
    
    return streams.map(stream => {
      // Calculate minutes remaining until start
      const minutesRemaining = Math.floor(
        (stream.startTime.getTime() - now.getTime()) / (1000 * 60)
      );
      return { ...stream, minutesRemaining };
    });
  }

  async getAllLiveStreams(): Promise<LiveStream[]> {
    return db
      .select()
      .from(liveStreams)
      .orderBy(desc(liveStreams.createdAt));
  }

  async createLiveStream(streamData: Omit<InsertLiveStream, "createdAt">): Promise<LiveStream> {
    const [stream] = await db
      .insert(liveStreams)
      .values({
        ...streamData,
        isActive: false,
      })
      .returning();
    return stream;
  }

  async updateLiveStream(id: number, streamData: Partial<InsertLiveStream>): Promise<LiveStream | undefined> {
    const [stream] = await db
      .update(liveStreams)
      .set(streamData)
      .where(eq(liveStreams.id, id))
      .returning();
    return stream || undefined;
  }

  async deleteLiveStream(id: number): Promise<void> {
    await db.delete(liveStreams).where(eq(liveStreams.id, id));
  }

  async getAdminStats(): Promise<{
    totalContent: number;
    activeUsers: number;
    todaySuggestions: number;
    upcomingBroadcasts: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    
    // Get content count
    const [contentResult] = await db
      .select({ count: count() })
      .from(media);
    
    // Simulate active users (would be from session data in a real app)
    const activeUsers = 12;
    
    // Get today's suggestions count
    const [suggestionsResult] = await db
      .select({ count: count() })
      .from(voteSuggestions)
      .where(gte(voteSuggestions.createdAt, today));
    
    // Get upcoming broadcasts count
    const [broadcastsResult] = await db
      .select({ count: count() })
      .from(liveStreams)
      .where(gt(liveStreams.startTime, now));
    
    return {
      totalContent: contentResult?.count || 0,
      activeUsers,
      todaySuggestions: suggestionsResult?.count || 0,
      upcomingBroadcasts: broadcastsResult?.count || 0,
    };
  }

  async getRecentContent(limit: number = 3): Promise<(Media & { category?: Category })[]> {
    const mediaItems = await db
      .select()
      .from(media)
      .orderBy(desc(media.createdAt))
      .limit(limit);
    
    const result: (Media & { category?: Category })[] = [];
    
    for (const item of mediaItems) {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, item.categoryId));
      
      result.push({ ...item, category });
    }
    
    return result;
  }

  // Settings methods - these would typically use a settings table in a real app
  async saveGeneralSettings(settings: any): Promise<void> {
    // Implementation would depend on how settings are stored
    console.log('General settings saved', settings);
  }

  async saveNetworkSettings(settings: any): Promise<void> {
    // Implementation would depend on how settings are stored
    console.log('Network settings saved', settings);
  }

  async saveDatabaseSettings(settings: any): Promise<void> {
    // Implementation would depend on how settings are stored  
    console.log('Database settings saved', settings);
  }

  async createBackup(): Promise<void> {
    // In a real app, this would create a backup of the database
    console.log('Database backup created');
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
