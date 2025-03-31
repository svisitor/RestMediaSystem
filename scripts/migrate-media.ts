import { db } from '../server/db';
import { media } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * This script adds two new fields to existing media items:
 * - isPopular: boolean - set to true for some media items
 * - badgeText: string - a custom message to display in the badge
 */
async function migrateMedia() {
  try {
    console.log('Starting media migration...');

    // Get all existing media items
    const mediaItems = await db.select().from(media);
    console.log(`Found ${mediaItems.length} media items to migrate`);

    // Update sample media items
    for (const item of mediaItems) {
      // For this example, make old items "popular" and leave badgeText empty
      // In a real application, you would use more sophisticated logic
      if (item.id % 2 === 0) { // Make every other item "popular"
        await db
          .update(media)
          .set({ isPopular: true })
          .where(eq(media.id, item.id));
        console.log(`Updated media ID: ${item.id} (${item.title}) as popular`);
      }

      // Add some custom badge text to a few items
      if (item.id === 1) {
        await db
          .update(media)
          .set({ badgeText: 'مميز' })
          .where(eq(media.id, item.id));
        console.log(`Added custom badge text to media ID: ${item.id} (${item.title})`);
      }
    }

    console.log('Media migration completed successfully!');
  } catch (error) {
    console.error('Error during media migration:', error);
  }
}

// Run the migration
migrateMedia();