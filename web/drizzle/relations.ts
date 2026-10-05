import { relations } from "drizzle-orm/relations";
import { members, businesses, events, eventRsvps, sponsors, blogPosts, users, sessions, galleryVideos, disciplines, galleryAlbums, galleryPhotos, activityLog, countries, accounts } from "./schema";

export const businessesRelations = relations(businesses, ({one, many}) => ({
	member_ownerMemberId: one(members, {
		fields: [businesses.ownerMemberId],
		references: [members.id],
		relationName: "businesses_ownerMemberId_members_id"
	}),
	member_reviewedBy: one(members, {
		fields: [businesses.reviewedBy],
		references: [members.id],
		relationName: "businesses_reviewedBy_members_id"
	}),
	sponsors: many(sponsors),
}));

export const membersRelations = relations(members, ({one, many}) => ({
	businesses_ownerMemberId: many(businesses, {
		relationName: "businesses_ownerMemberId_members_id"
	}),
	businesses_reviewedBy: many(businesses, {
		relationName: "businesses_reviewedBy_members_id"
	}),
	eventRsvps: many(eventRsvps),
	events: many(events),
	blogPosts: many(blogPosts),
	galleryVideos: many(galleryVideos),
	galleryPhotos: many(galleryPhotos),
	activityLogs: many(activityLog),
	user: one(users, {
		fields: [members.userId],
		references: [users.id]
	}),
	discipline: one(disciplines, {
		fields: [members.disciplineId],
		references: [disciplines.id]
	}),
	country: one(countries, {
		fields: [members.countryId],
		references: [countries.id]
	}),
	member: one(members, {
		fields: [members.reviewedBy],
		references: [members.id],
		relationName: "members_reviewedBy_members_id"
	}),
	members: many(members, {
		relationName: "members_reviewedBy_members_id"
	}),
	galleryAlbums: many(galleryAlbums),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({one}) => ({
	event: one(events, {
		fields: [eventRsvps.eventId],
		references: [events.id]
	}),
	member: one(members, {
		fields: [eventRsvps.memberId],
		references: [members.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	eventRsvps: many(eventRsvps),
	member: one(members, {
		fields: [events.createdBy],
		references: [members.id]
	}),
	galleryVideos: many(galleryVideos),
	galleryAlbums: many(galleryAlbums),
}));

export const sponsorsRelations = relations(sponsors, ({one}) => ({
	business: one(businesses, {
		fields: [sponsors.businessId],
		references: [businesses.id]
	}),
}));

export const blogPostsRelations = relations(blogPosts, ({one}) => ({
	member: one(members, {
		fields: [blogPosts.authorMemberId],
		references: [members.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	sessions: many(sessions),
	members: many(members),
	accounts: many(accounts),
}));

export const galleryVideosRelations = relations(galleryVideos, ({one}) => ({
	member: one(members, {
		fields: [galleryVideos.addedBy],
		references: [members.id]
	}),
	event: one(events, {
		fields: [galleryVideos.eventId],
		references: [events.id]
	}),
	discipline: one(disciplines, {
		fields: [galleryVideos.disciplineId],
		references: [disciplines.id]
	}),
}));

export const disciplinesRelations = relations(disciplines, ({many}) => ({
	galleryVideos: many(galleryVideos),
	members: many(members),
	galleryAlbums: many(galleryAlbums),
}));

export const galleryPhotosRelations = relations(galleryPhotos, ({one}) => ({
	galleryAlbum: one(galleryAlbums, {
		fields: [galleryPhotos.albumId],
		references: [galleryAlbums.id]
	}),
	member: one(members, {
		fields: [galleryPhotos.uploadedBy],
		references: [members.id]
	}),
}));

export const galleryAlbumsRelations = relations(galleryAlbums, ({one, many}) => ({
	galleryPhotos: many(galleryPhotos),
	member: one(members, {
		fields: [galleryAlbums.createdBy],
		references: [members.id]
	}),
	event: one(events, {
		fields: [galleryAlbums.eventId],
		references: [events.id]
	}),
	discipline: one(disciplines, {
		fields: [galleryAlbums.disciplineId],
		references: [disciplines.id]
	}),
}));

export const activityLogRelations = relations(activityLog, ({one}) => ({
	member: one(members, {
		fields: [activityLog.actorMemberId],
		references: [members.id]
	}),
}));

export const countriesRelations = relations(countries, ({many}) => ({
	members: many(members),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));