import { db } from "../server/db";
import { 
  users, 
  categories, 
  media, 
  seriesSeasons, 
  seriesEpisodes, 
  voteSuggestions, 
  voteRecords, 
  liveStreams,
  advertisements 
} from "../shared/schema";
import { sql } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function insertTestData() {
  try {
    console.log("Starting to insert test data...");

    // 1. Insert users
    console.log("Inserting users...");
    const hashedAdminPassword = await hashPassword('admin123');
    const hashedGuestPassword = await hashPassword('guest123');
    
    const [adminUser, guestUser] = await db.insert(users).values([
      {
        username: "admin",
        password: hashedAdminPassword,
        displayName: "المدير",
        role: "admin"
      },
      {
        username: "guest",
        password: hashedGuestPassword,
        displayName: "ضيف",
        role: "guest"
      }
    ]).returning();
    
    console.log(`Inserted ${await db.select().from(users).execute().then(r => r.length)} users`);

    // 2. Insert categories
    console.log("Inserting categories...");
    const [actionCategory, comedyCategory, dramaCategory, sciFiCategory] = await db.insert(categories).values([
      { name: "Action & Adventure", type: "both" },
      { name: "Comedy", type: "both" },
      { name: "Drama", type: "both" },
      { name: "Sci-Fi", type: "both" }
    ]).returning();
    
    console.log(`Inserted ${await db.select().from(categories).execute().then(r => r.length)} categories`);

    // 3. Insert media (movies and series)
    console.log("Inserting media...");
    // Movies
    const [movie1, movie2] = await db.insert(media).values([
      {
        title: "فيلم الحركة",
        description: "فيلم حركة مليء بالإثارة والتشويق",
        type: "movie",
        categoryId: actionCategory.id,
        thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        year: 2023,
        isPopular: true,
        badgeText: "جديد"
      },
      {
        title: "فيلم الكوميديا",
        description: "فيلم كوميدي خفيف ومضحك للغاية",
        type: "movie",
        categoryId: comedyCategory.id,
        thumbnailUrl: "https://images.unsplash.com/photo-1615110095141-c7911238fca0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        year: 2022,
        isPopular: false,
        badgeText: null
      }
    ]).returning();

    // Series
    const [series1, series2] = await db.insert(media).values([
      {
        title: "مسلسل دراما",
        description: "مسلسل درامي جديد ومثير",
        type: "series",
        categoryId: dramaCategory.id,
        thumbnailUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        filePath: "", // Series don't have direct file paths
        year: 2023,
        isPopular: true,
        badgeText: "حصري"
      },
      {
        title: "مسلسل خيال علمي",
        description: "مسلسل خيال علمي مستقبلي",
        type: "series",
        categoryId: sciFiCategory.id,
        thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        filePath: "", // Series don't have direct file paths
        year: 2022,
        isPopular: false,
        badgeText: null
      }
    ]).returning();
    
    console.log(`Inserted ${await db.select().from(media).execute().then(r => r.length)} media items`);

    // 4. Insert series seasons and episodes
    console.log("Inserting series seasons and episodes...");
    // Seasons for series1
    const [season1Series1, season2Series1] = await db.insert(seriesSeasons).values([
      { 
        mediaId: series1.id, 
        seasonNumber: 1, 
        title: "الموسم الأول" 
      },
      { 
        mediaId: series1.id, 
        seasonNumber: 2, 
        title: "الموسم الثاني" 
      }
    ]).returning();

    // Episodes for season1 of series1
    await db.insert(seriesEpisodes).values([
      { 
        seasonId: season1Series1.id, 
        episodeNumber: 1, 
        title: "البداية", 
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" 
      },
      { 
        seasonId: season1Series1.id, 
        episodeNumber: 2, 
        title: "المواجهة", 
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" 
      }
    ]);

    // Episodes for season2 of series1
    await db.insert(seriesEpisodes).values([
      { 
        seasonId: season2Series1.id, 
        episodeNumber: 1, 
        title: "العودة", 
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" 
      },
      { 
        seasonId: season2Series1.id, 
        episodeNumber: 2, 
        title: "النهاية", 
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" 
      }
    ]);

    // Seasons for series2
    const [season1Series2] = await db.insert(seriesSeasons).values([
      { 
        mediaId: series2.id, 
        seasonNumber: 1, 
        title: "الموسم الأول" 
      }
    ]).returning();

    // Episodes for season1 of series2
    await db.insert(seriesEpisodes).values([
      { 
        seasonId: season1Series2.id, 
        episodeNumber: 1, 
        title: "الحلقة الأولى", 
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" 
      },
      { 
        seasonId: season1Series2.id, 
        episodeNumber: 2, 
        title: "الحلقة الثانية", 
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" 
      },
      { 
        seasonId: season1Series2.id, 
        episodeNumber: 3, 
        title: "الحلقة الثالثة", 
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" 
      }
    ]);
    
    console.log(`Inserted ${await db.select().from(seriesSeasons).execute().then(r => r.length)} seasons`);
    console.log(`Inserted ${await db.select().from(seriesEpisodes).execute().then(r => r.length)} episodes`);

    // 5. Insert vote suggestions
    console.log("Inserting vote suggestions...");
    const [voteSuggestion1, voteSuggestion2] = await db.insert(voteSuggestions).values([
      {
        title: "فيلم المغامرات الجديد",
        type: "movie",
        categoryId: actionCategory.id,
        userId: guestUser.id,
        votes: 5,
        status: "pending"
      },
      {
        title: "مسلسل الكوميديا الجديد",
        type: "series",
        categoryId: comedyCategory.id,
        userId: guestUser.id,
        votes: 3,
        status: "approved"
      }
    ]).returning();
    
    console.log(`Inserted ${await db.select().from(voteSuggestions).execute().then(r => r.length)} vote suggestions`);

    // 6. Insert vote records
    console.log("Inserting vote records...");
    await db.insert(voteRecords).values([
      {
        suggestionId: voteSuggestion1.id,
        userId: guestUser.id
      },
      {
        suggestionId: voteSuggestion1.id,
        userId: adminUser.id
      },
      {
        suggestionId: voteSuggestion2.id,
        userId: guestUser.id
      }
    ]);
    
    console.log(`Inserted ${await db.select().from(voteRecords).execute().then(r => r.length)} vote records`);

    // 7. Insert live streams
    console.log("Inserting live streams...");
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowPlusHour = new Date(tomorrow.getTime() + 60 * 60 * 1000);
    
    await db.insert(liveStreams).values([
      {
        title: "بث مباشر للمباراة النهائية",
        description: "بث مباشر للمباراة النهائية في دوري كرة القدم",
        category: "رياضة",
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        startTime: now,
        endTime: oneHourLater,
        isActive: true
      },
      {
        title: "بث مباشر للحفل الموسيقي",
        description: "بث مباشر للحفل الموسيقي السنوي",
        category: "ترفيه",
        streamUrl: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
        startTime: tomorrow,
        endTime: tomorrowPlusHour,
        isActive: false
      }
    ]);
    
    console.log(`Inserted ${await db.select().from(liveStreams).execute().then(r => r.length)} live streams`);

    // 8. Insert advertisements
    console.log("Inserting advertisements...");
    const todayStart = new Date();
    const oneMonthLater = new Date(todayStart.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    await db.insert(advertisements).values([
      {
        title: "عرض الافتتاح الكبير",
        description: "خصم 50% على جميع المنتجات الجديدة",
        imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        linkUrl: "/media/1",
        startDate: todayStart,
        endDate: oneMonthLater,
        isActive: true,
        priority: 1
      },
      {
        title: "شاهد أحدث الأفلام",
        description: "أفلام جديدة كل أسبوع",
        imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        linkUrl: "/movies",
        startDate: todayStart,
        endDate: oneMonthLater,
        isActive: true,
        priority: 2
      },
      {
        title: "عرض مشاهدة المسلسلات",
        description: "شاهد أفضل المسلسلات بجودة عالية",
        imageUrl: "https://images.unsplash.com/photo-1572188863110-46d457c9234d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        linkUrl: "/series",
        startDate: todayStart,
        endDate: oneMonthLater,
        isActive: true,
        priority: 3
      }
    ]);
    
    console.log(`Inserted ${await db.select().from(advertisements).execute().then(r => r.length)} advertisements`);

    console.log("Test data inserted successfully!");
    return true;
  } catch (error) {
    console.error("Error inserting test data:", error);
    return false;
  }
}

// Execute the function
insertTestData().then((success) => {
  if (success) {
    console.log("Script completed successfully");
    process.exit(0);
  } else {
    console.error("Script failed");
    process.exit(1);
  }
});