import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  serial,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ======================================================
   USER & AUTH
====================================================== */

export const user = pgTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const account = pgTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),

  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),

  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),

  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),

  scope: text("scope"),
  password: text("password"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(),
  token: text("token").notNull().unique(),

  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jwks = pgTable("jwks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ======================================================
   CHAT CORE
====================================================== */

export const conversations = pgTable(
  "conversations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),

    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    title: varchar("title", { length: 255 }),

    type: varchar("type", { length: 20 })
      .$type<"text" | "rag" | "image">()
      .default("text")
      .notNull(),

    documentId: varchar("document_id", { length: 36 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("conversations_user_idx").on(table.userId),
    updatedAtIdx: index("conversations_updated_at_idx").on(table.updatedAt),
  })
);

export const messages = pgTable(
  "messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),

    conversationId: varchar("conversation_id", { length: 36 })
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),

    role: varchar("role", { length: 20 })
      .$type<"user" | "assistant" | "system">()
      .notNull(),

    content: text("content").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    conversationIdx: index("messages_conversation_idx").on(
      table.conversationId
    ),
    createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
  })
);

/* ======================================================
   DOCUMENTS (RAG)
====================================================== */

export const documents = pgTable(
  "documents",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    collectionName: varchar("collection_name", { length: 255 }).notNull(),
    chunkCount: integer("chunk_count").notNull(),

    userId: varchar("user_id", { length: 36 }).references(() => user.id, {
      onDelete: "cascade",
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("documents_user_idx").on(table.userId),
  })
);

/* ======================================================
   PROMPTS & IMAGES
====================================================== */

export const prompts = pgTable("prompts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  prompt: text("prompt").notNull(),
  response: text("response"),
  url: text("url"),
  seed: serial("seed"),

  userId: varchar("user_id", { length: 36 }).references(() => user.id, {
    onDelete: "cascade",
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const images = pgTable("images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  prompt: text("prompt").notNull(),
  url: text("url"),
  seed: serial("seed"),

  userId: varchar("user_id", { length: 36 }).references(() => user.id, {
    onDelete: "cascade",
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ======================================================
   RELATIONS
====================================================== */

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  conversations: many(conversations),
  prompts: many(prompts),
  images: many(images),
  documents: many(documents),
}));

export const conversationRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(user, {
      fields: [conversations.userId],
      references: [user.id],
    }),
    messages: many(messages),
  })
);

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

/* ======================================================
   EXPORT
====================================================== */

export const schema = {
  user,
  account,
  session,
  verification,
  jwks,
  conversations,
  messages,
  documents,
  prompts,
  images,
};
