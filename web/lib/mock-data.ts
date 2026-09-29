import type { Business, BlogPost, EventItem, Member, Sponsor } from "./types";

// Ported verbatim from the original static mockup's sample data — see
// db/seed_members.sql for the same data as SQL, for whenever a real
// backend replaces this file.
export const members: Member[] = [
  { id: "1", name: "Tahmina Akter", initials: "TA", discipline: "Architecture", profession: "Architect", city: "Dhaka", email: "tahmina@example.com", platformRole: "superadmin", status: "active", joinedAt: "Jan 2025" },
  { id: "2", name: "Rafiul Islam", initials: "RI", discipline: "Computer Science & Engineering", profession: "Software engineer", city: "Berlin", email: "rafiul@example.com", platformRole: "admin", status: "active", joinedAt: "Feb 2025" },
  { id: "3", name: "Nusrat Jahan", initials: "NJ", discipline: "Pharmacy", profession: "Research scientist", city: "Khulna", email: "nusrat@example.com", platformRole: "member", status: "active", joinedAt: "Feb 2025" },
  { id: "4", name: "Mahmudul Hasan", initials: "MH", discipline: "Business Administration", profession: "Branch manager", city: "Chattogram", email: "mahmudul@example.com", platformRole: "member", status: "active", joinedAt: "Mar 2025" },
  { id: "5", name: "Sabrina Rahman", initials: "SR", discipline: "Urban & Rural Planning", profession: "Urban planner", city: "Dhaka", email: "sabrina@example.com", platformRole: "member", status: "pending", joinedAt: "Sep 2026" },
  { id: "6", name: "Arif Khan", initials: "AK", discipline: "Forestry & Wood Technology", profession: "Forest officer", city: "Bagerhat", email: "arif@example.com", platformRole: "admin", status: "active", joinedAt: "Apr 2025" },
  { id: "7", name: "Farzana Sultana", initials: "FS", discipline: "English", profession: "Lecturer", city: "Jashore", email: "farzana@example.com", platformRole: "member", status: "active", joinedAt: "Jan 2025" },
  { id: "8", name: "Imran Hossain", initials: "IH", discipline: "Electronics & Communication Eng.", profession: "Network engineer", city: "Dubai", email: "imran@example.com", platformRole: "member", status: "pending", joinedAt: "Sep 2026" },
  { id: "9", name: "Lamia Noor", initials: "LN", discipline: "Environmental Science", profession: "Climate analyst", city: "Toronto", email: "lamia@example.com", platformRole: "member", status: "suspended", joinedAt: "Jun 2025" },
  { id: "10", name: "Shafiqul Mamun", initials: "SM", discipline: "Economics", profession: "Policy researcher", city: "Dhaka", email: "shafiqul@example.com", platformRole: "member", status: "active", joinedAt: "Jan 2025" },
  { id: "11", name: "Rumana Begum", initials: "RB", discipline: "Fisheries & Marine Resource Tech.", profession: "Aquaculture consultant", city: "Satkhira", email: "rumana@example.com", platformRole: "member", status: "active", joinedAt: "Jan 2025" },
  { id: "12", name: "Tanvir Hasan", initials: "TH", discipline: "Mathematics", profession: "Data scientist", city: "Sydney", email: "tanvir@example.com", platformRole: "member", status: "active", joinedAt: "Jan 2025" },
];

export const businesses: Business[] = [
  {
    slug: "batchworks-catering", initials: "BW", name: "BatchWorks Catering", category: "Food & Catering",
    ownerName: "Tahmina Akter", city: "Dhaka", status: "active", submittedAt: "Jan 2026",
    tagline: "Home-style Bengali catering for reunions, office lunches and family events — run by a batchmate, trusted by the batch.",
    description: "BatchWorks Catering started in [YEAR] out of a batchmate's home kitchen in Dhaka. We now cater office lunches, family gatherings, and — every December — the Batch 11 Grand Reunion itself. Every order is prepared fresh, with menus that can flex for vegetarian, halal, and allergy needs.",
    offerings: ["Event catering", "Office lunch plans", "Home delivery", "Custom menus"],
    testimonial: "Booked BatchWorks for our department reunion — tasted like home. Highly recommend to any batchmate planning an event.",
  },
  { slug: "islam-software-consulting", initials: "IC", name: "Islam Software Consulting", category: "Tech Services", ownerName: "Rafiul Islam", city: "Berlin", status: "active", submittedAt: "Feb 2026", tagline: "Software consulting for small teams.", description: "Software consulting for small teams.", offerings: [], testimonial: "" },
  { slug: "gollamari-coffee-roasters", initials: "GC", name: "Gollamari Coffee Roasters", category: "Food & Catering", ownerName: "Arif Khan", city: "Bagerhat", status: "active", submittedAt: "Mar 2026", tagline: "Small-batch coffee roasted in Bagerhat.", description: "Small-batch coffee roasted in Bagerhat.", offerings: [], testimonial: "" },
  { slug: "rahman-urban-planning-studio", initials: "RS", name: "Rahman Urban Planning Studio", category: "Consulting", ownerName: "Sabrina Rahman", city: "Dhaka", status: "pending", submittedAt: "Sep 2026", tagline: "Urban planning consultancy.", description: "Urban planning consultancy.", offerings: [], testimonial: "" },
  { slug: "sultana-language-academy", initials: "SL", name: "Sultana Language Academy", category: "Education", ownerName: "Farzana Sultana", city: "Jashore", status: "active", submittedAt: "Apr 2026", tagline: "English language coaching.", description: "English language coaching.", offerings: [], testimonial: "" },
  { slug: "hossain-network-solutions", initials: "HN", name: "Hossain Network Solutions", category: "Tech Services", ownerName: "Imran Hossain", city: "Dubai", status: "pending", submittedAt: "Sep 2026", tagline: "Network infrastructure consulting.", description: "Network infrastructure consulting.", offerings: [], testimonial: "" },
  { slug: "begum-aquaculture-exports", initials: "BE", name: "Begum Aquaculture Exports", category: "Retail & Trade", ownerName: "Rumana Begum", city: "Satkhira", status: "active", submittedAt: "May 2026", tagline: "Aquaculture exports.", description: "Aquaculture exports.", offerings: [], testimonial: "" },
  { slug: "sundarban-eco-tours", initials: "ST", name: "Sundarban Eco Tours", category: "Travel & Tourism", ownerName: "Lamia Noor", city: "Toronto", status: "rejected", submittedAt: "Jun 2026", tagline: "Guided Sundarbans eco tours.", description: "Guided Sundarbans eco tours.", offerings: [], testimonial: "" },
];

export const sponsors: Sponsor[] = [
  { id: "1", initials: "GC", name: "Gollamari Coffee Roasters", tier: "diamond", website: "gollamaricoffee.example", active: true },
  { id: "2", initials: "IC", name: "Islam Software Consulting", tier: "gold", website: "islamconsulting.example", active: true },
  { id: "3", initials: "BW", name: "BatchWorks Catering", tier: "silver", website: "batchworkscatering.example", active: true },
  { id: "4", initials: "HN", name: "Hossain Network Solutions", tier: "silver", website: "hossainnetworks.example", active: true },
  { id: "5", initials: "BE", name: "Begum Aquaculture Exports", tier: "bronze", website: "begumaquaculture.example", active: false },
];

export const blogPosts: BlogPost[] = [
  { slug: "planning-the-grand-reunion", category: "Reunion", title: "Planning the grand reunion: what we need from you", author: "Reunion committee", date: "Sep 24", readTime: "5 min" },
  { slug: "sundarbans-field-trip", category: "Memories", title: "Our first-year field trip to the Sundarbans", author: "Arif Khan", date: "Sep 10", readTime: "7 min" },
  { slug: "starting-over-abroad", category: "Careers", title: "Starting over abroad: notes from Toronto", author: "Lamia Noor", date: "Aug 28", readTime: "6 min" },
  { slug: "gollamari-since-we-left", category: "Campus", title: "What has changed at Gollamari since we left", author: "Nusrat Jahan", date: "Aug 15", readTime: "4 min" },
];

export const albums = [
  { name: "Orientation day", count: "[00] photos" },
  { name: "Rag day", count: "[00] photos" },
  { name: "Sundarbans field trip", count: "[00] photos" },
  { name: "Convocation", count: "[00] photos" },
  { name: "Sports week", count: "[00] photos" },
  { name: "Grand reunion", count: "[00] photos" },
];

export const videos = [
  { title: "Rag day highlights" },
  { title: "Convocation day on campus" },
  { title: "Grand reunion — full recap" },
];

export const events: EventItem[] = [
  { id: "1", slug: "batch-11-grand-reunion", title: "Batch 11 Grand Reunion", month: "DEC", day: "12", dateLabel: "Saturday, Dec 12", timeLabel: "10:00 AM – 8:00 PM", location: "Khulna University campus", category: "Reunion", featured: true, description: "A full day back on campus: a morning walk through the departments, lunch together, a photo session at the central field and a cultural evening. Families are welcome." },
  { id: "2", slug: "career-talk-batchmates-in-tech", title: "Career talk: Batchmates in tech", month: "JAN", day: "18", dateLabel: "Jan 18", timeLabel: "8:30 PM", location: "Online · Zoom", category: "Online", description: "" },
  { id: "3", slug: "iftar-get-together-dhaka-chapter", title: "Iftar get-together, Dhaka chapter", month: "MAR", day: "02", dateLabel: "Mar 02", timeLabel: "5:30 PM", location: "Dhanmondi, Dhaka", category: "Chapter", description: "" },
  { id: "4", slug: "tree-planting-at-gollamari", title: "Tree planting at Gollamari", month: "MAR", day: "20", dateLabel: "Mar 20", timeLabel: "9:00 AM", location: "Khulna University campus", category: "Volunteer", description: "" },
];
