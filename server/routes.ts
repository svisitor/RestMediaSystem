import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import createMemoryStore from "memorystore";
import { 
  InsertUser, 
  insertVoteSuggestionSchema,
  insertMediaSchema,
  insertAdvertisementSchema
} from "@shared/schema";
import { z } from "zod";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "lounge-manager-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
      },
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Configure Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  // Authentication routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const categories = await storage.getCategories(type);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Media routes
  app.get("/api/media", async (req, res) => {
    try {
      const { type, categoryId, search, limit } = req.query;
      const media = await storage.getMedia({
        type: type as string | undefined,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.get("/api/media/featured", async (req, res) => {
    try {
      const featuredMedia = await storage.getFeaturedMedia();
      res.json(featuredMedia);
    } catch (error) {
      console.error("Error fetching featured media:", error);
      res.status(500).json({ message: "Failed to fetch featured media" });
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const media = await storage.getMediaById(id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      res.json(media);
    } catch (error) {
      console.error("Error fetching media details:", error);
      res.status(500).json({ message: "Failed to fetch media details" });
    }
  });

  // Admin media routes
  app.post("/api/media", isAdmin, async (req, res) => {
    try {
      const validatedData = insertMediaSchema.parse(req.body);
      const newMedia = await storage.createMedia(validatedData);
      res.status(201).json(newMedia);
    } catch (error) {
      console.error("Error creating media:", error);
      res.status(400).json({ message: "Invalid media data" });
    }
  });

  app.patch("/api/media/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMediaSchema.partial().parse(req.body);
      const updatedMedia = await storage.updateMedia(id, validatedData);
      
      if (!updatedMedia) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      res.json(updatedMedia);
    } catch (error) {
      console.error("Error updating media:", error);
      res.status(400).json({ message: "Invalid media data" });
    }
  });

  app.delete("/api/media/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMedia(id);
      res.json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Vote suggestions routes
  app.get("/api/vote-suggestions", async (req, res) => {
    try {
      const voteSuggestions = await storage.getVoteSuggestions();
      res.json(voteSuggestions);
    } catch (error) {
      console.error("Error fetching vote suggestions:", error);
      res.status(500).json({ message: "Failed to fetch vote suggestions" });
    }
  });

  app.post("/api/vote-suggestions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Check if user has reached the daily limit
      const remainingSuggestions = await storage.getRemainingDailySuggestions(userId);
      if (remainingSuggestions <= 0) {
        return res.status(403).json({ message: "Daily suggestion limit reached" });
      }
      
      const validatedData = insertVoteSuggestionSchema.parse({
        ...req.body,
        userId
      });
      
      const newSuggestion = await storage.createVoteSuggestion(validatedData);
      res.status(201).json(newSuggestion);
    } catch (error) {
      console.error("Error creating vote suggestion:", error);
      res.status(400).json({ message: "Invalid vote suggestion data" });
    }
  });

  app.post("/api/vote-suggestions/:id/vote", isAuthenticated, async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // Check if user has already voted for this suggestion
      const hasVoted = await storage.hasUserVotedForSuggestion(userId, suggestionId);
      if (hasVoted) {
        return res.status(403).json({ message: "Already voted for this suggestion" });
      }
      
      await storage.voteForSuggestion(userId, suggestionId);
      res.json({ message: "Vote recorded successfully" });
    } catch (error) {
      console.error("Error recording vote:", error);
      res.status(500).json({ message: "Failed to record vote" });
    }
  });

  // Admin voting routes
  app.post("/api/vote-suggestions/:id/approve", isAdmin, async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      await storage.approveSuggestion(suggestionId);
      res.json({ message: "Suggestion approved successfully" });
    } catch (error) {
      console.error("Error approving suggestion:", error);
      res.status(500).json({ message: "Failed to approve suggestion" });
    }
  });

  app.post("/api/vote-suggestions/:id/reject", isAdmin, async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      await storage.rejectSuggestion(suggestionId);
      res.json({ message: "Suggestion rejected successfully" });
    } catch (error) {
      console.error("Error rejecting suggestion:", error);
      res.status(500).json({ message: "Failed to reject suggestion" });
    }
  });

  // Live streaming routes
  app.get("/api/live-streams/active", async (req, res) => {
    try {
      const activeStream = await storage.getActiveLiveStream();
      if (!activeStream) {
        return res.status(404).json({ message: "No active live stream" });
      }
      res.json(activeStream);
    } catch (error) {
      console.error("Error fetching active live stream:", error);
      res.status(500).json({ message: "Failed to fetch active live stream" });
    }
  });

  app.get("/api/live-streams/upcoming", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const upcomingStreams = await storage.getUpcomingLiveStreams(limit);
      res.json(upcomingStreams);
    } catch (error) {
      console.error("Error fetching upcoming live streams:", error);
      res.status(500).json({ message: "Failed to fetch upcoming live streams" });
    }
  });

  app.get("/api/live-streams/all", isAdmin, async (req, res) => {
    try {
      const allStreams = await storage.getAllLiveStreams();
      res.json(allStreams);
    } catch (error) {
      console.error("Error fetching all live streams:", error);
      res.status(500).json({ message: "Failed to fetch all live streams" });
    }
  });

  app.post("/api/live-streams", isAdmin, async (req, res) => {
    try {
      const newStream = await storage.createLiveStream(req.body);
      res.status(201).json(newStream);
    } catch (error) {
      console.error("Error creating live stream:", error);
      res.status(400).json({ message: "Invalid live stream data" });
    }
  });

  app.patch("/api/live-streams/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedStream = await storage.updateLiveStream(id, req.body);
      
      if (!updatedStream) {
        return res.status(404).json({ message: "Live stream not found" });
      }
      
      res.json(updatedStream);
    } catch (error) {
      console.error("Error updating live stream:", error);
      res.status(400).json({ message: "Invalid live stream data" });
    }
  });

  app.delete("/api/live-streams/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLiveStream(id);
      res.json({ message: "Live stream deleted successfully" });
    } catch (error) {
      console.error("Error deleting live stream:", error);
      res.status(500).json({ message: "Failed to delete live stream" });
    }
  });

  // User-related routes
  app.get("/api/users/suggestions-count", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const remainingSuggestions = await storage.getRemainingDailySuggestions(userId);
      res.json(remainingSuggestions);
    } catch (error) {
      console.error("Error fetching remaining suggestions count:", error);
      res.status(500).json({ message: "Failed to fetch remaining suggestions count" });
    }
  });

  // Admin user management routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const users = await storage.getUsers(search);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const userData: InsertUser = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.patch("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let userData = req.body;
      
      // If password is provided, hash it
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Don't allow deleting admin users
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role === "admin") {
        return res.status(403).json({ message: "Cannot delete admin users" });
      }
      
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin dashboard routes
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/recent-content", isAdmin, async (req, res) => {
    try {
      const recentContent = await storage.getRecentContent();
      res.json(recentContent);
    } catch (error) {
      console.error("Error fetching recent content:", error);
      res.status(500).json({ message: "Failed to fetch recent content" });
    }
  });

  app.get("/api/admin/top-voted", isAdmin, async (req, res) => {
    try {
      const topVoted = await storage.getTopVotedSuggestions();
      res.json(topVoted);
    } catch (error) {
      console.error("Error fetching top voted suggestions:", error);
      res.status(500).json({ message: "Failed to fetch top voted suggestions" });
    }
  });

  app.get("/api/admin/vote-suggestions", isAdmin, async (req, res) => {
    try {
      const voteSuggestions = await storage.getAllVoteSuggestions();
      res.json(voteSuggestions);
    } catch (error) {
      console.error("Error fetching all vote suggestions:", error);
      res.status(500).json({ message: "Failed to fetch all vote suggestions" });
    }
  });

  // Advertisement routes
  app.get("/api/advertisements/active", async (req, res) => {
    try {
      const activeAds = await storage.getActiveAdvertisements();
      res.json(activeAds);
    } catch (error) {
      console.error("Error fetching active advertisements:", error);
      res.status(500).json({ message: "Failed to fetch active advertisements" });
    }
  });

  app.get("/api/advertisements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ad = await storage.getAdvertisement(id);
      
      if (!ad) {
        return res.status(404).json({ message: "Advertisement not found" });
      }
      
      res.json(ad);
    } catch (error) {
      console.error("Error fetching advertisement details:", error);
      res.status(500).json({ message: "Failed to fetch advertisement details" });
    }
  });

  // Admin advertisement routes
  app.get("/api/advertisements", isAdmin, async (req, res) => {
    try {
      const allAds = await storage.getAllAdvertisements();
      res.json(allAds);
    } catch (error) {
      console.error("Error fetching all advertisements:", error);
      res.status(500).json({ message: "Failed to fetch all advertisements" });
    }
  });

  app.post("/api/advertisements", isAdmin, async (req, res) => {
    try {
      const validatedData = insertAdvertisementSchema.parse(req.body);
      const newAd = await storage.createAdvertisement(validatedData);
      res.status(201).json(newAd);
    } catch (error) {
      console.error("Error creating advertisement:", error);
      res.status(400).json({ message: "Invalid advertisement data" });
    }
  });

  app.patch("/api/advertisements/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAdvertisementSchema.partial().parse(req.body);
      const updatedAd = await storage.updateAdvertisement(id, validatedData);
      
      if (!updatedAd) {
        return res.status(404).json({ message: "Advertisement not found" });
      }
      
      res.json(updatedAd);
    } catch (error) {
      console.error("Error updating advertisement:", error);
      res.status(400).json({ message: "Invalid advertisement data" });
    }
  });

  app.delete("/api/advertisements/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAdvertisement(id);
      res.json({ message: "Advertisement deleted successfully" });
    } catch (error) {
      console.error("Error deleting advertisement:", error);
      res.status(500).json({ message: "Failed to delete advertisement" });
    }
  });
  
  // Admin settings routes
  app.post("/api/admin/settings/general", isAdmin, async (req, res) => {
    try {
      await storage.saveGeneralSettings(req.body);
      res.json({ message: "General settings updated successfully" });
    } catch (error) {
      console.error("Error updating general settings:", error);
      res.status(500).json({ message: "Failed to update general settings" });
    }
  });

  app.post("/api/admin/settings/network", isAdmin, async (req, res) => {
    try {
      await storage.saveNetworkSettings(req.body);
      res.json({ message: "Network settings updated successfully" });
    } catch (error) {
      console.error("Error updating network settings:", error);
      res.status(500).json({ message: "Failed to update network settings" });
    }
  });

  app.post("/api/admin/settings/database", isAdmin, async (req, res) => {
    try {
      await storage.saveDatabaseSettings(req.body);
      res.json({ message: "Database settings updated successfully" });
    } catch (error) {
      console.error("Error updating database settings:", error);
      res.status(500).json({ message: "Failed to update database settings" });
    }
  });

  app.post("/api/admin/backup", isAdmin, async (req, res) => {
    try {
      await storage.createBackup();
      res.json({ message: "Backup created successfully" });
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
