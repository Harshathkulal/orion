import {
  pgTable,
  varchar,
  text,
  timestamp,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const prompts = pgTable("Prompt", {
  id: varchar("id", { length: 36 }).primaryKey(),
  prompt: text("prompt").notNull(),
  response: text("response"),
  url: text("url"),
  seed: serial("seed"),
  userId: varchar("userId", { length: 36 }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const images = pgTable("Image", {
  id: varchar("id", { length: 36 }).primaryKey(),
  prompt: text("prompt").notNull(),
  url: text("url"),
  seed: serial("seed"),
  userId: varchar("userId", { length: 36 }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
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
  question: text("last_query").notNull(),
  response: text("last_response").notNull(),
  createdAt: timestamp("updated_at").defaultNow().notNull(),
});

// Optional: relations for type inference and joins
export const usersRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  prompts: many(prompts),
  images: many(images),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const promptsRelations = relations(prompts, ({ one }) => ({
  user: one(user, {
    fields: [prompts.userId],
    references: [user.id],
  }),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  user: one(user, {
    fields: [images.userId],
    references: [user.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(user, {
    fields: [documents.userId],
    references: [user.id],
  }),
}));

export const ragChatsRelations = relations(ragChats, ({ one }) => ({
  user: one(user, {
    fields: [ragChats.userId],
    references: [user.id],
  }),
}));

export const schema = {
  user,
  session,
  account,
  verification,
  jwks,
  prompts,
  images,
  documents,
  ragChats,
};
