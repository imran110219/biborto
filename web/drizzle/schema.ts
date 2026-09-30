import { pgTable, unique, uuid, text, timestamp, foreignKey, index, date, boolean, time, primaryKey, integer, pgView, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const blogCategory = pgEnum("blog_category", ['Reunion', 'Memories', 'Careers', 'Campus'])
export const blogStatus = pgEnum("blog_status", ['draft', 'published'])
export const blogVisibility = pgEnum("blog_visibility", ['public', 'members_only'])
export const bloodGroup = pgEnum("blood_group", ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
export const businessCategory = pgEnum("business_category", ['Food & Catering', 'Tech Services', 'Consulting', 'Education', 'Retail & Trade', 'Travel & Tourism'])
export const businessStatus = pgEnum("business_status", ['pending', 'active', 'rejected'])
export const eventCategory = pgEnum("event_category", ['Reunion', 'Online', 'Chapter', 'Volunteer'])
export const memberPlatformRole = pgEnum("member_platform_role", ['member', 'admin', 'superadmin'])
export const memberStatus = pgEnum("member_status", ['pending', 'active', 'suspended'])
export const rsvpStatus = pgEnum("rsvp_status", ['going', 'interested', 'declined'])
export const schoolName = pgEnum("school_name", ['Science, Engineering & Technology School', 'Management & Business Administration School', 'Life Science School', 'Arts & Humanities School', 'Social Science School', 'Fine Arts School', 'Law School', 'Education School'])
export const sponsorTier = pgEnum("sponsor_tier", ['diamond', 'gold', 'silver', 'bronze'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash"),
	name: text(),
	image: text(),
	emailVerified: timestamp("email_verified", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const sessions = pgTable("sessions", {
	sessionToken: text("session_token").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_fkey"
		}).onDelete("cascade"),
]);

export const disciplines = pgTable("disciplines", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	school: schoolName().notNull(),
	name: text().notNull(),
	shortCode: text("short_code").notNull(),
	slug: text().notNull(),
	websitePath: text("website_path").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("disciplines_school_idx").using("btree", table.school.asc().nullsLast().op("enum_ops")),
	unique("disciplines_code_key").on(table.code),
	unique("disciplines_name_key").on(table.name),
	unique("disciplines_short_code_key").on(table.shortCode),
	unique("disciplines_slug_key").on(table.slug),
	unique("disciplines_website_path_key").on(table.websitePath),
]);

export const countries = pgTable("countries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	isoCode: text("iso_code").notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("countries_iso_code_key").on(table.isoCode),
	unique("countries_name_key").on(table.name),
]);

export const members = pgTable("members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	slug: text().notNull(),
	name: text().notNull(),
	disciplineId: uuid("discipline_id"),
	profession: text(),
	currentEmployer: text("current_employer"),
	bio: text(),
	city: text(),
	countryId: uuid("country_id"),
	avatarKey: text("avatar_key"),
	linkedinUrl: text("linkedin_url"),
	facebookUrl: text("facebook_url"),
	websiteUrl: text("website_url"),
	email: text().notNull(),
	phoneNumber: text("phone_number"),
	studentId: text("student_id"),
	platformRole: memberPlatformRole("platform_role").default('member').notNull(),
	status: memberStatus().default('pending').notNull(),
	bloodGroup: bloodGroup("blood_group"),
	dateOfBirth: date("date_of_birth"),
	isPublic: boolean("is_public").default(true).notNull(),
	joinedAt: timestamp("joined_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	reviewedBy: uuid("reviewed_by"),
	reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("members_city_idx").using("btree", table.city.asc().nullsLast().op("text_ops")),
	index("members_discipline_idx").using("btree", table.disciplineId.asc().nullsLast().op("uuid_ops")),
	index("members_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "members_user_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.disciplineId],
			foreignColumns: [disciplines.id],
			name: "members_discipline_id_fkey"
		}),
	foreignKey({
			columns: [table.countryId],
			foreignColumns: [countries.id],
			name: "members_country_id_fkey"
		}),
	foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [table.id],
			name: "members_reviewed_by_fkey"
		}).onDelete("set null"),
	unique("members_slug_key").on(table.slug),
	unique("members_email_key").on(table.email),
]);

export const businesses = pgTable("businesses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: text().notNull(),
	ownerMemberId: uuid("owner_member_id"),
	name: text().notNull(),
	category: businessCategory().notNull(),
	city: text(),
	status: businessStatus().default('pending').notNull(),
	tagline: text(),
	description: text(),
	offerings: text().array().notNull(),
	testimonial: text(),
	phone: text(),
	email: text(),
	website: text(),
	coverPhotoKey: text("cover_photo_key"),
	logoKey: text("logo_key"),
	submittedAt: timestamp("submitted_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	reviewedBy: uuid("reviewed_by"),
	reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("businesses_category_idx").using("btree", table.category.asc().nullsLast().op("enum_ops")),
	index("businesses_owner_idx").using("btree", table.ownerMemberId.asc().nullsLast().op("uuid_ops")),
	index("businesses_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.ownerMemberId],
			foreignColumns: [members.id],
			name: "businesses_owner_member_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [members.id],
			name: "businesses_reviewed_by_fkey"
		}).onDelete("set null"),
	unique("businesses_slug_key").on(table.slug),
]);

export const sponsors = pgTable("sponsors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	name: text().notNull(),
	tier: sponsorTier().notNull(),
	website: text(),
	logoKey: text("logo_key"),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("sponsors_tier_idx").using("btree", table.tier.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "sponsors_business_id_fkey"
		}).onDelete("set null"),
]);

export const events = pgTable("events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: text().notNull(),
	title: text().notNull(),
	eventDate: date("event_date").notNull(),
	startTime: time("start_time"),
	endTime: time("end_time"),
	location: text(),
	category: eventCategory(),
	description: text(),
	featured: boolean().default(false).notNull(),
	coverPhotoKey: text("cover_photo_key"),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("events_event_date_idx").using("btree", table.eventDate.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [members.id],
			name: "events_created_by_fkey"
		}).onDelete("set null"),
	unique("events_slug_key").on(table.slug),
]);

export const eventRsvps = pgTable("event_rsvps", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id").notNull(),
	memberId: uuid("member_id").notNull(),
	status: rsvpStatus().default('going').notNull(),
	bringingFamily: boolean("bringing_family").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("event_rsvps_event_idx").using("btree", table.eventId.asc().nullsLast().op("uuid_ops")),
	index("event_rsvps_member_idx").using("btree", table.memberId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "event_rsvps_event_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [members.id],
			name: "event_rsvps_member_id_fkey"
		}).onDelete("cascade"),
	unique("event_rsvps_event_id_member_id_key").on(table.memberId, table.eventId),
]);

export const blogPosts = pgTable("blog_posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: text().notNull(),
	category: blogCategory().notNull(),
	title: text().notNull(),
	authorMemberId: uuid("author_member_id"),
	authorName: text("author_name"),
	body: text().notNull(),
	coverPhotoKey: text("cover_photo_key"),
	tags: text().array().notNull(),
	status: blogStatus().default('draft').notNull(),
	visibility: blogVisibility().default('public').notNull(),
	featured: boolean().default(false).notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("blog_posts_category_idx").using("btree", table.category.asc().nullsLast().op("enum_ops")),
	index("blog_posts_published_at_idx").using("btree", table.publishedAt.desc().nullsFirst().op("timestamptz_ops")),
	index("blog_posts_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.authorMemberId],
			foreignColumns: [members.id],
			name: "blog_posts_author_member_id_fkey"
		}).onDelete("set null"),
	unique("blog_posts_slug_key").on(table.slug),
]);

export const galleryAlbums = pgTable("gallery_albums", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: text().notNull(),
	name: text().notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [members.id],
			name: "gallery_albums_created_by_fkey"
		}).onDelete("set null"),
	unique("gallery_albums_slug_key").on(table.slug),
]);

export const galleryPhotos = pgTable("gallery_photos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	albumId: uuid("album_id").notNull(),
	r2Key: text("r2_key").notNull(),
	caption: text(),
	uploadedBy: uuid("uploaded_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("gallery_photos_album_idx").using("btree", table.albumId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.albumId],
			foreignColumns: [galleryAlbums.id],
			name: "gallery_photos_album_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [members.id],
			name: "gallery_photos_uploaded_by_fkey"
		}).onDelete("set null"),
]);

export const galleryVideos = pgTable("gallery_videos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	youtubeUrl: text("youtube_url"),
	addedBy: uuid("added_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.addedBy],
			foreignColumns: [members.id],
			name: "gallery_videos_added_by_fkey"
		}).onDelete("set null"),
]);

export const activityLog = pgTable("activity_log", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	actorMemberId: uuid("actor_member_id"),
	action: text().notNull(),
	targetType: text("target_type").notNull(),
	targetId: uuid("target_id"),
	summary: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("activity_log_created_at_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.actorMemberId],
			foreignColumns: [members.id],
			name: "activity_log_actor_member_id_fkey"
		}).onDelete("set null"),
]);

export const verificationTokens = pgTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.token, table.identifier], name: "verification_tokens_pkey"}),
]);

export const accounts = pgTable("accounts", {
	userId: uuid("user_id").notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text("provider_account_id").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.providerAccountId, table.provider], name: "accounts_pkey"}),
]);
export const publicMembers = pgView("public_members", {	id: uuid(),
	slug: text(),
	name: text(),
	disciplineId: uuid("discipline_id"),
	profession: text(),
	currentEmployer: text("current_employer"),
	bio: text(),
	city: text(),
	countryId: uuid("country_id"),
	avatarKey: text("avatar_key"),
	linkedinUrl: text("linkedin_url"),
	facebookUrl: text("facebook_url"),
	websiteUrl: text("website_url"),
}).as(sql`SELECT id, slug, name, discipline_id, profession, current_employer, bio, city, country_id, avatar_key, linkedin_url, facebook_url, website_url FROM members WHERE status = 'active'::member_status AND is_public = true`);

export const publicBusinesses = pgView("public_businesses", {	id: uuid(),
	slug: text(),
	name: text(),
	category: businessCategory(),
	city: text(),
	tagline: text(),
	description: text(),
	offerings: text(),
	testimonial: text(),
	phone: text(),
	email: text(),
	website: text(),
	coverPhotoKey: text("cover_photo_key"),
	logoKey: text("logo_key"),
	submittedAt: timestamp("submitted_at", { withTimezone: true, mode: 'string' }),
}).as(sql`SELECT id, slug, name, category, city, tagline, description, offerings, testimonial, phone, email, website, cover_photo_key, logo_key, submitted_at FROM businesses WHERE status = 'active'::business_status`);

export const publicBlogPosts = pgView("public_blog_posts", {	id: uuid(),
	slug: text(),
	category: blogCategory(),
	title: text(),
	authorMemberId: uuid("author_member_id"),
	authorName: text("author_name"),
	body: text(),
	coverPhotoKey: text("cover_photo_key"),
	tags: text(),
	featured: boolean(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
}).as(sql`SELECT id, slug, category, title, author_member_id, author_name, body, cover_photo_key, tags, featured, published_at FROM blog_posts WHERE status = 'published'::blog_status AND visibility = 'public'::blog_visibility`);
