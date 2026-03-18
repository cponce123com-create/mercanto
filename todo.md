# Mercanto - Project TODO

## Database & Schema
- [x] Design and implement complete Drizzle schema with all tables
- [x] Generate and apply database migrations
- [x] Create database helper functions in server/db.ts

## Authentication & Roles
- [x] Extend user table with role field (user, vendor, admin)
- [x] Implement role-based access control (RBAC)
- [x] Create protected procedures for vendor and admin routes
- [ ] Test authentication flow

## Backend Modules
- [x] Stores module: CRUD operations, slug generation, validation
- [x] Products module: CRUD, image management, offer system
- [x] Categories module: CRUD, hierarchy support
- [x] Tacora module: CRUD for second-hand listings
- [ ] Comparator module: price comparison logic, normalization
- [x] Orders module: CRUD, status management
- [ ] Admin module: dashboard, moderation, reports
- [ ] Uploads module: Cloudinary integration helpers

## Frontend - Core Pages
- [x] Home page with hero, featured products, categories, offers
- [x] Search page with filters and results
- [x] Category page with product listing
- [x] Product detail page with images and store info
- [x] Store detail page with products and info
- [x] Stores listing page with search and filters
- [ ] Tacora listing page
- [ ] Tacora detail page

## Frontend - Authentication
- [ ] Login/Register flow
- [ ] User profile page
- [ ] Favorites system
- [ ] My orders page

## Vendor Panel
- [x] Vendor dashboard with metrics
- [x] Store management (create, edit, logo/banner/gallery)
- [x] Product management (CRUD, offers) - backend ready
- [ ] Tacora management (CRUD) - backend ready
- [ ] Orders management - backend ready
- [x] Vendor configuration

## Admin Panel
- [ ] Admin dashboard with global metrics
- [ ] Users management
- [ ] Stores management (approve, suspend, feature)
- [ ] Products management (review, delete, feature)
- [ ] Categories management
- [ ] Tacora moderation
- [ ] Banners management
- [ ] Reports and analytics

## Cloudinary Integration
- [x] Set up Cloudinary API integration
- [x] Implement image upload for stores (logo, banner, gallery)
- [x] Implement image upload for products
- [x] Implement image upload for Tacora
- [ ] Implement image upload for banners
- [x] Create upload validation (size, format)

## Price Comparator
- [ ] Implement product normalization logic
- [ ] Create price comparison queries
- [ ] Build comparator UI
- [ ] Implement trending products

## Tacora (Second-hand)
- [ ] Create Tacora listing form
- [ ] Implement listing management
- [ ] Build Tacora browse page
- [ ] Add contact vendor functionality

## Orders System
- [ ] Implement order creation
- [ ] Order status management
- [ ] Vendor order dashboard
- [ ] WhatsApp contact integration
- [ ] Order history for customers

## Testing & Polish
- [ ] Write Vitest tests for critical functions
- [ ] Test authentication flows
- [ ] Test RBAC enforcement
- [ ] Validate image uploads
- [ ] Performance optimization
- [ ] Error handling and user feedback
- [ ] Mobile responsiveness check
