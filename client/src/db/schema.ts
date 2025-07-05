import { pgTable, varchar, text, timestamp, serial ,integer} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("User", {
  id: varchar("id", { length: 36 }).primaryKey(), // cuid length is ~25
  clerkId: varchar("clerkId", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  profileImageUrl: text("profileImageUrl"),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  clerkSessionId: varchar("clerk_session_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const prompts = pgTable("Prompt", {
  id: varchar("id", { length: 36 }).primaryKey(),
  prompt: text("prompt").notNull(),
  response: text("response"),
  url: text("url"),
  seed: serial("seed"),
  userId: varchar("userId", { length: 36 }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const images = pgTable("Image", {
  id: varchar("id", { length: 36 }).primaryKey(),
  prompt: text("prompt").notNull(),
  url: text("url"),
  seed: serial("seed"),
  userId: varchar("userId", { length: 36 }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id", { length: 36 }).primaryKey(), 
  name: varchar("name", { length: 255 }).notNull(), 
  collectionName: varchar("collection_name", { length: 255 }).notNull(),
  chunkCount: integer("chunk_count").notNull(), 
  userId: varchar("user_id", { length: 36 }),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).defaultNow().notNull(),
});

export const ragChats = pgTable("rag_chats", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }),
  collectionName: varchar("collection_name", { length: 255 }).notNull(),
  Query: text("last_query").notNull(),
  Response: text("last_response").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Optional: relations for type inference and joins
export const usersRelations = relations(users, ({ many }) => ({
  prompts: many(prompts),
  images: many(images),
}));

export const promptsRelations = relations(prompts, ({ one }) => ({
  user: one(users, {
    fields: [prompts.userId],
    references: [users.id],
  }),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  user: one(users, {
    fields: [images.userId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

export const ragChatsRelations = relations(ragChats, ({ one }) => ({
  user: one(users, {
    fields: [ragChats.userId],
    references: [users.id],
  }),
}));