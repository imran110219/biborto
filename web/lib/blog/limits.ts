// A member may have this many blog posts waiting for review at once, so the
// admin queue can't be flooded. (Published and rejected posts don't count.)
export const MAX_PENDING_POSTS_PER_MEMBER = 5;
export const MAX_POST_BODY = 20_000;
export const MIN_POST_BODY = 100;

// Blog images (editor uploads): see lib/blog/images.ts and /api/blog/images.
export const MAX_BLOG_IMAGE_SIZE = 8 * 1024 * 1024;
// Members (not admins) can have this many stored blog images, so the bucket can't
// be filled through the editor. Unused uploads count until an admin cleans up.
export const MAX_BLOG_IMAGES_PER_MEMBER = 40;
