import { pgTable, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizationsTable } from "./organizations";

export const monthlyReportsTable = pgTable("monthly_reports", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  totalFoodKg: integer("total_food_kg").notNull().default(0),
  totalPeopleFed: integer("total_people_fed").notNull().default(0),
  reportData: jsonb("report_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMonthlyReportSchema = createInsertSchema(monthlyReportsTable).omit({ id: true, createdAt: true });
export type InsertMonthlyReport = z.infer<typeof insertMonthlyReportSchema>;
export type MonthlyReport = typeof monthlyReportsTable.$inferSelect;
