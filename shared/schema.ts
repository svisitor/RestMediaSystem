import { pgTable, text, serial, integer, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("guest"), // guest, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Media categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // movie, series, both
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Movies and TV series
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // movie, series
  categoryId: integer("category_id").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  filePath: text("file_path").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
});

// Series-specific information (for series media)
export const seriesSeasons = pgTable("series_seasons", {
  id: serial("id").primaryKey(),
  mediaId: integer("media_id").notNull(),
  seasonNumber: integer("season_number").notNull(),
  title: text("title").notNull(),
});

export const insertSeriesSeasonSchema = createInsertSchema(seriesSeasons).omit({
  id: true,
});

export const seriesEpisodes = pgTable("series_episodes", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id").notNull(),
  episodeNumber: integer("episode_number").notNull(),
  title: text("title").notNull(),
  filePath: text("file_path").notNull(),
});

export const insertSeriesEpisodeSchema = createInsertSchema(seriesEpisodes).omit({
  id: true,
});

// Voting system
export const voteSuggestions = pgTable("vote_suggestions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // movie, series
  categoryId: integer("category_id").notNull(),
  userId: integer("user_id").notNull(),
  votes: integer("votes").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const insertVoteSuggestionSchema = createInsertSchema(voteSuggestions).omit({
  id: true,
  votes: true,
  status: true,
  createdAt: true,
  processedAt: true,
});

export const voteRecords = pgTable("vote_records", {
  id: serial("id").primaryKey(),
  suggestionId: integer("suggestion_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVoteRecordSchema = createInsertSchema(voteRecords).omit({
  id: true,
  createdAt: true,
});

// Live streaming
export const liveStreams = pgTable("live_streams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  streamUrl: text("stream_url").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLiveStreamSchema = createInsertSchema(liveStreams).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type SeriesSeason = typeof seriesSeasons.$inferSelect;
export type InsertSeriesSeason = z.infer<typeof insertSeriesSeasonSchema>;

export type SeriesEpisode = typeof seriesEpisodes.$inferSelect;
export type InsertSeriesEpisode = z.infer<typeof insertSeriesEpisodeSchema>;

export type VoteSuggestion = typeof voteSuggestions.$inferSelect;
export type InsertVoteSuggestion = z.infer<typeof insertVoteSuggestionSchema>;

export type VoteRecord = typeof voteRecords.$inferSelect;
export type InsertVoteRecord = z.infer<typeof insertVoteRecordSchema>;

export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;

// Advertisements/Offers schema
export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  createdAt: true,
});

export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;

// Define table relations
export const usersRelations = relations(users, ({ many }) => ({
  voteSuggestions: many(voteSuggestions),
  voteRecords: many(voteRecords)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  media: many(media),
  voteSuggestions: many(voteSuggestions)
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  category: one(categories, {
    fields: [media.categoryId],
    references: [categories.id]
  }),
  seasons: many(seriesSeasons)
}));

export const seriesSeasonsRelations = relations(seriesSeasons, ({ one, many }) => ({
  media: one(media, {
    fields: [seriesSeasons.mediaId],
    references: [media.id]
  }),
  episodes: many(seriesEpisodes)
}));

export const seriesEpisodesRelations = relations(seriesEpisodes, ({ one }) => ({
  season: one(seriesSeasons, {
    fields: [seriesEpisodes.seasonId],
    references: [seriesSeasons.id]
  })
}));

export const voteSuggestionsRelations = relations(voteSuggestions, ({ one, many }) => ({
  category: one(categories, {
    fields: [voteSuggestions.categoryId],
    references: [categories.id]
  }),
  user: one(users, {
    fields: [voteSuggestions.userId],
    references: [users.id]
  }),
  votes: many(voteRecords)
}));

export const voteRecordsRelations = relations(voteRecords, ({ one }) => ({
  suggestion: one(voteSuggestions, {
    fields: [voteRecords.suggestionId],
    references: [voteSuggestions.id]
  }),
  user: one(users, {
    fields: [voteRecords.userId],
    references: [users.id]
  })
}));

export const advertisementsRelations = relations(advertisements, ({}) => ({}));
