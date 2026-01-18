import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export chat models
export * from "./models/chat";

// Users (wallet-based authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  walletAddress: true,
  displayName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Document categories
export const DOCUMENT_CATEGORIES = [
  "Research",
  "Legal",
  "Educational",
  "Business",
  "Technical",
  "Creative",
  "Data",
  "Other",
] as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];

// Documents (encrypted files listed for sale)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priceUsdc: decimal("price_usdc", { precision: 10, scale: 2 }).notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  fileType: text("file_type").notNull(),
  ipfsHash: text("ipfs_hash").notNull(), // encrypted file location
  encryptionIv: text("encryption_iv").notNull(), // for AES-256-GCM
  thumbnailUrl: text("thumbnail_url"),
  downloads: integer("downloads").default(0).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  ratingCount: integer("rating_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  downloads: true,
  rating: true,
  ratingCount: true,
  createdAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Purchases/Transactions
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  amountUsdc: decimal("amount_usdc", { precision: 10, scale: 2 }).notNull(),
  platformFeeUsdc: decimal("platform_fee_usdc", { precision: 10, scale: 2 }).notNull(),
  sellerRevenueUsdc: decimal("seller_revenue_usdc", { precision: 10, scale: 2 }).notNull(),
  txHash: text("tx_hash"), // Arc transaction hash
  x402PaymentId: text("x402_payment_id"),
  status: text("status").notNull().default("completed"), // pending, completed, failed
  purchasedByAgent: boolean("purchased_by_agent").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

// AI Agent Sessions
export const agentSessions = pgTable("agent_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  budgetUsdc: decimal("budget_usdc", { precision: 10, scale: 2 }).notNull(),
  spentUsdc: decimal("spent_usdc", { precision: 10, scale: 2 }).default("0").notNull(),
  searchQuery: text("search_query").notNull(),
  maxPricePerDoc: decimal("max_price_per_doc", { precision: 10, scale: 2 }),
  category: text("category"),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  documentsFound: integer("documents_found").default(0).notNull(),
  documentsPurchased: integer("documents_purchased").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAgentSessionSchema = createInsertSchema(agentSessions).omit({
  id: true,
  spentUsdc: true,
  documentsFound: true,
  documentsPurchased: true,
  createdAt: true,
});

export type InsertAgentSession = z.infer<typeof insertAgentSessionSchema>;
export type AgentSession = typeof agentSessions.$inferSelect;

// Agent Activity Log
export const agentActivities = pgTable("agent_activities", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => agentSessions.id),
  action: text("action").notNull(), // search, evaluate, purchase, complete
  details: text("details").notNull(),
  documentId: integer("document_id").references(() => documents.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAgentActivitySchema = createInsertSchema(agentActivities).omit({
  id: true,
  createdAt: true,
});

export type InsertAgentActivity = z.infer<typeof insertAgentActivitySchema>;
export type AgentActivity = typeof agentActivities.$inferSelect;

// Document with seller info for marketplace display
export type DocumentWithSeller = Document & {
  seller: Pick<User, "id" | "walletAddress" | "displayName">;
};

// Stats types
export type SellerStats = {
  totalRevenue: string;
  totalSales: number;
  documentsListed: number;
  avgRating: string;
};

export type MarketplaceStats = {
  totalDocuments: number;
  totalSales: number;
  totalVolume: string;
  avgPrice: string;
};
