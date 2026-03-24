import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { foodListingsTable } from "./food_listings";
import { usersTable } from "./users";
import { organizationsTable } from "./organizations";

export const deliveryStatusEnum = pgEnum("delivery_status", ["pending", "accepted", "picked_up", "delivered"]);

export const deliveriesTable = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => foodListingsTable.id),
  carrierId: integer("carrier_id").notNull().references(() => usersTable.id),
  recipientOrgId: integer("recipient_org_id").references(() => organizationsTable.id),
  status: deliveryStatusEnum("status").notNull().default("pending"),
  photoUrl: text("photo_url"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDeliverySchema = createInsertSchema(deliveriesTable).omit({ id: true, createdAt: true, status: true, completedAt: true });
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveriesTable.$inferSelect;
