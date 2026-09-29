-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."blog_category" AS ENUM('Reunion', 'Memories', 'Careers', 'Campus');--> statement-breakpoint
CREATE TYPE "public"."blog_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."blog_visibility" AS ENUM('public', 'members_only');--> statement-breakpoint
CREATE TYPE "public"."blood_group" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');--> statement-breakpoint
CREATE TYPE "public"."business_category" AS ENUM('Food & Catering', 'Tech Services', 'Consulting', 'Education', 'Retail & Trade', 'Travel & Tourism');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('pending', 'active', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."event_category" AS ENUM('Reunion', 'Online', 'Chapter', 'Volunteer');--> statement-breakpoint
CREATE TYPE "public"."member_platform_role" AS ENUM('member', 'editor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."rsvp_status" AS ENUM('going', 'interested', 'declined');--> statement-breakpoint
CREATE TYPE "public"."school_name" AS ENUM('Science, Engineering & Technology School', 'Management & Business Administration School', 'Life Science School', 'Arts & Humanities School', 'Social Science School', 'Fine Arts School', 'Law School', 'Education School');--> statement-breakpoint
CREATE TYPE "public"."sponsor_tier" AS ENUM('diamond', 'gold', 'silver', 'bronze');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"google_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email"),
	CONSTRAINT "users_google_id_key" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "disciplines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"school" "school_name" NOT NULL,
	"name" text NOT NULL,
	"short_code" text NOT NULL,
	"slug" text NOT NULL,
	"website_path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "disciplines_code_key" UNIQUE("code"),
	CONSTRAINT "disciplines_name_key" UNIQUE("name"),
	CONSTRAINT "disciplines_short_code_key" UNIQUE("short_code"),
	CONSTRAINT "disciplines_slug_key" UNIQUE("slug"),
	CONSTRAINT "disciplines_website_path_key" UNIQUE("website_path")
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"iso_code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "countries_iso_code_key" UNIQUE("iso_code"),
	CONSTRAINT "countries_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"discipline_id" uuid NOT NULL,
	"profession" text,
	"current_employer" text,
	"bio" text,
	"city" text,
	"country_id" uuid,
	"avatar_key" text,
	"linkedin_url" text,
	"facebook_url" text,
	"website_url" text,
	"email" text NOT NULL,
	"phone_number" text,
	"student_id" text,
	"platform_role" "member_platform_role" DEFAULT 'member' NOT NULL,
	"status" "member_status" DEFAULT 'pending' NOT NULL,
	"blood_group" "blood_group",
	"date_of_birth" date,
	"is_public" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_slug_key" UNIQUE("slug"),
	CONSTRAINT "members_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"owner_member_id" uuid,
	"name" text NOT NULL,
	"category" "business_category" NOT NULL,
	"city" text,
	"status" "business_status" DEFAULT 'pending' NOT NULL,
	"tagline" text,
	"description" text,
	"offerings" text[] NOT NULL,
	"testimonial" text,
	"phone" text,
	"email" text,
	"website" text,
	"cover_photo_key" text,
	"logo_key" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"name" text NOT NULL,
	"tier" "sponsor_tier" NOT NULL,
	"website" text,
	"logo_key" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"event_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"location" text,
	"category" "event_category",
	"description" text,
	"featured" boolean DEFAULT false NOT NULL,
	"cover_photo_key" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"status" "rsvp_status" DEFAULT 'going' NOT NULL,
	"bringing_family" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_rsvps_event_id_member_id_key" UNIQUE("member_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category" "blog_category" NOT NULL,
	"title" text NOT NULL,
	"author_member_id" uuid,
	"author_name" text,
	"body" text NOT NULL,
	"cover_photo_key" text,
	"tags" text[] NOT NULL,
	"status" "blog_status" DEFAULT 'draft' NOT NULL,
	"visibility" "blog_visibility" DEFAULT 'public' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gallery_albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"album_id" uuid NOT NULL,
	"r2_key" text NOT NULL,
	"caption" text,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"youtube_url" text,
	"added_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_member_id" uuid,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "public"."disciplines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_member_id_fkey" FOREIGN KEY ("owner_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_member_id_fkey" FOREIGN KEY ("author_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_albums" ADD CONSTRAINT "gallery_albums_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."gallery_albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_videos" ADD CONSTRAINT "gallery_videos_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_member_id_fkey" FOREIGN KEY ("actor_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "disciplines_school_idx" ON "disciplines" USING btree ("school" enum_ops);--> statement-breakpoint
CREATE INDEX "members_city_idx" ON "members" USING btree ("city" text_ops);--> statement-breakpoint
CREATE INDEX "members_discipline_idx" ON "members" USING btree ("discipline_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "members_status_idx" ON "members" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "businesses_category_idx" ON "businesses" USING btree ("category" enum_ops);--> statement-breakpoint
CREATE INDEX "businesses_owner_idx" ON "businesses" USING btree ("owner_member_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "businesses_status_idx" ON "businesses" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "sponsors_tier_idx" ON "sponsors" USING btree ("tier" enum_ops);--> statement-breakpoint
CREATE INDEX "events_event_date_idx" ON "events" USING btree ("event_date" date_ops);--> statement-breakpoint
CREATE INDEX "event_rsvps_event_idx" ON "event_rsvps" USING btree ("event_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "event_rsvps_member_idx" ON "event_rsvps" USING btree ("member_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "blog_posts_category_idx" ON "blog_posts" USING btree ("category" enum_ops);--> statement-breakpoint
CREATE INDEX "blog_posts_published_at_idx" ON "blog_posts" USING btree ("published_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "blog_posts_status_idx" ON "blog_posts" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "gallery_photos_album_idx" ON "gallery_photos" USING btree ("album_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "activity_log_created_at_idx" ON "activity_log" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE VIEW "public"."public_members" AS (SELECT id, slug, name, discipline_id, profession, current_employer, bio, city, country_id, avatar_key, linkedin_url, facebook_url, website_url FROM members WHERE status = 'active'::member_status AND is_public = true);--> statement-breakpoint
CREATE VIEW "public"."public_businesses" AS (SELECT id, slug, name, category, city, tagline, description, offerings, testimonial, phone, email, website, cover_photo_key, logo_key, submitted_at FROM businesses WHERE status = 'active'::business_status);--> statement-breakpoint
CREATE VIEW "public"."public_blog_posts" AS (SELECT id, slug, category, title, author_member_id, author_name, body, cover_photo_key, tags, featured, published_at FROM blog_posts WHERE status = 'published'::blog_status AND visibility = 'public'::blog_visibility);
*/