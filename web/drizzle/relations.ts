import { relations } from "drizzle-orm/relations";
import { users, members, businesses, events, eventRsvps, sponsors, blogPosts, galleryAlbums, galleryPhotos, galleryVideos, activityLog } from "./schema";

export const membersRelations = relations(members, ({one, many}) => ({
	user: one(users, {
		fields: [members.userId],
		references: [users.id]
	}),
	member: one(members, {
		fields: [members.reviewedBy],
		references: [members.id],
		relationName: "members_reviewedBy_members_id"
	}),
	members: many(members, {
		relationName: "members_reviewedBy_members_id"
	}),
	businesses_ownerMemberId: many(businesses, {
		relationName: "businesses_ownerMemberId_members_id"
	}),
	businesses_reviewedBy: many(businesses, {
		relationName: "businesses_reviewedBy_members_id"
	}),
	eventRsvps: many(eventRsvps),
	events: many(events),
	blogPosts: many(blogPosts),
	galleryAlbums: many(galleryAlbums),
	galleryPhotos: many(galleryPhotos),
	galleryVideos: many(galleryVideos),
	activityLogs: many(activityLog),
}));

export const usersRelations = relations(users, ({many}) => ({
	members: many(members),
}));

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

export const galleryAlbumsRelations = relations(galleryAlbums, ({one, many}) => ({
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