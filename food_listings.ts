import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizationsTable } from "./organizations";

export const foodCategoryEnum = pgEnum("food_category", ["human", "animal"]);
export const listingStatusEnum = pgEnum("listing_status", ["open", "assigned", "delivered", "expired"]);

export const foodListingsTable = pgTable("food_listings", {
  id: serial("id").primaryKey(),
  donorOrgId: integer("donor_org_id").notNull().references(() => organizationsTable.id),
  foodType: text("food_type").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  category: foodCategoryEnum("category").notNull().default("human"),
  status: listingStatusEnum("status").notNull().default("open"),
  pickupDeadline: timestamp("pickup_deadline").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFoodListingSchema = createInsertSchema(foodListingsTable).omit({ id: true, createdAt: true, status: true, category: true });
export type InsertFoodListing = z.infer<typeof insertFoodListingSchema>;
export type FoodListing = typeof foodListingsTable.$inferSelect;
