CREATE TABLE "documents" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"collection_name" varchar(255) NOT NULL,
	"chunk_count" integer NOT NULL,
	"user_id" varchar(36),
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Image" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"prompt" text NOT NULL,
	"url" text,
	"seed" serial NOT NULL,
	"userId" varchar(36),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Prompt" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"prompt" text NOT NULL,
	"response" text,
	"url" text,
	"seed" serial NOT NULL,
	"userId" varchar(36),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rag_chats" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"collection_name" varchar(255) NOT NULL,
	"last_query" text NOT NULL,
	"last_response" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"clerk_session_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"clerkId" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"firstName" varchar(255),
	"lastName" varchar(255),
	"profileImageUrl" text,
	CONSTRAINT "User_clerkId_unique" UNIQUE("clerkId"),
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;