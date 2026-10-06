import { relations } from "drizzle-orm/relations";
import { users, sessions, members, disciplines, countries, businesses, sponsors, events, eventRsvps, blogPosts, galleryAlbums, galleryPhotos, galleryVideos, activityLog, popups, accounts } from "./schema";

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

export const membersRelations = relations(members, ({one, many}) => ({
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
	events: many(events),
	eventRsvps: many(eventRsvps),
	blogPosts: many(blogPosts),
	galleryAlbums: many(galleryAlbums),
	galleryPhotos: many(galleryPhotos),
	galleryVideos: many(galleryVideos),
	activityLogs: many(activityLog),
	businesses_ownerMemberId: many(businesses, {
		relationName: "businesses_ownerMemberId_members_id"
	}),
	businesses_reviewedBy: many(businesses, {
		relationName: "businesses_reviewedBy_members_id"
	}),
	popups: many(popups),
}));

export const disciplinesRelations = relations(disciplines, ({many}) => ({
	members: many(members),
	galleryAlbums: many(galleryAlbums),
	galleryVideos: many(galleryVideos),
}));

export const countriesRelations = relations(countries, ({many}) => ({
	members: many(members),
}));

export const sponsorsRelations = relations(sponsors, ({one}) => ({
	business: one(businesses, {
		fields: [sponsors.businessId],
		references: [businesses.id]
	}),
}));

export const businessesRelations = relations(businesses, ({one, many}) => ({
	sponsors: many(sponsors),
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
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	member: one(members, {
		fields: [events.createdBy],
		references: [members.id]
	}),
	eventRsvps: many(eventRsvps),
	galleryAlbums: many(galleryAlbums),
	galleryVideos: many(galleryVideos),
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

export const blogPostsRelations = relations(blogPosts, ({one}) => ({
	member: one(members, {
		fields: [blogPosts.authorMemberId],
		references: [members.id]
	}),
}));

export const galleryAlbumsRelations = relations(galleryAlbums, ({one, many}) => ({
	event: one(events, {
		fields: [galleryAlbums.eventId],
		references: [events.id]
	}),
	discipline: one(disciplines, {
		fields: [galleryAlbums.disciplineId],
		references: [disciplines.id]
	}),
	member: one(members, {
		fields: [galleryAlbums.createdBy],
		references: [members.id]
	}),
	galleryPhotos: many(galleryPhotos),
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

export const galleryVideosRelations = relations(galleryVideos, ({one}) => ({
	event: one(events, {
		fields: [galleryVideos.eventId],
		references: [events.id]
	}),
	discipline: one(disciplines, {
		fields: [galleryVideos.disciplineId],
		references: [disciplines.id]
	}),
	member: one(members, {
		fields: [galleryVideos.addedBy],
		references: [members.id]
	}),
}));

export const activityLogRelations = relations(activityLog, ({one}) => ({
	member: one(members, {
		fields: [activityLog.actorMemberId],
		references: [members.id]
	}),
}));

export const popupsRelations = relations(popups, ({one}) => ({
	member: one(members, {
		fields: [popups.createdBy],
		references: [members.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));