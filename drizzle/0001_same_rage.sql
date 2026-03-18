CREATE TABLE `banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`subtitle` text,
	`image_url` text NOT NULL,
	`public_id` varchar(255),
	`link` text,
	`position` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`icon` text,
	`description` text,
	`parent_id` int,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`product_id` int,
	`tacora_post_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`product_id` int NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyer_id` int NOT NULL,
	`store_id` int NOT NULL,
	`status` enum('pending','processing','completed','cancelled') NOT NULL DEFAULT 'pending',
	`total_amount` decimal(10,2) NOT NULL,
	`payment_method` varchar(50),
	`delivery_type` enum('pickup','delivery') NOT NULL DEFAULT 'pickup',
	`delivery_address` text,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_normalized_name` varchar(200) NOT NULL,
	`category_id` int NOT NULL,
	`unit` varchar(50),
	`lowest_price` decimal(10,2) NOT NULL,
	`average_price` decimal(10,2) NOT NULL,
	`highest_price` decimal(10,2) NOT NULL,
	`vendor_count` int NOT NULL DEFAULT 0,
	`report_date` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`url` text NOT NULL,
	`public_id` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int NOT NULL,
	`category_id` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`offer_price` decimal(10,2),
	`stock` int NOT NULL DEFAULT 0,
	`unit` varchar(50),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`is_featured` boolean NOT NULL DEFAULT false,
	`total_views` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`store_id` int,
	`product_id` int,
	`tacora_post_id` int,
	`rating` int NOT NULL,
	`comment` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `store_gallery_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int NOT NULL,
	`url` text NOT NULL,
	`public_id` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `store_gallery_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`logo_url` text,
	`logo_public_id` varchar(255),
	`banner_url` text,
	`banner_public_id` varchar(255),
	`whatsapp` varchar(20),
	`location` text,
	`schedule` text,
	`main_category_id` int,
	`status` enum('pending','active','suspended') NOT NULL DEFAULT 'pending',
	`is_featured` boolean NOT NULL DEFAULT false,
	`total_visits` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `stores_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `stores_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `tacora_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tacora_post_id` int NOT NULL,
	`url` text NOT NULL,
	`public_id` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tacora_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tacora_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`store_id` int,
	`category_id` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`condition` enum('new','like_new','good','fair','poor') NOT NULL,
	`location` text,
	`status` enum('active','sold','inactive') NOT NULL DEFAULT 'active',
	`is_featured` boolean NOT NULL DEFAULT false,
	`total_views` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tacora_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','vendor','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `users` ADD `is_blocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD `last_signed_in` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `banners` (`is_active`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `parent_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `favorites` (`user_id`);--> statement-breakpoint
CREATE INDEX `product_idx` ON `favorites` (`product_id`);--> statement-breakpoint
CREATE INDEX `tacora_idx` ON `favorites` (`tacora_post_id`);--> statement-breakpoint
CREATE INDEX `order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `product_idx` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `buyer_idx` ON `orders` (`buyer_id`);--> statement-breakpoint
CREATE INDEX `store_idx` ON `orders` (`store_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `price_reports` (`product_normalized_name`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `price_reports` (`category_id`);--> statement-breakpoint
CREATE INDEX `product_idx` ON `product_images` (`product_id`);--> statement-breakpoint
CREATE INDEX `store_idx` ON `products` (`store_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `reviews` (`user_id`);--> statement-breakpoint
CREATE INDEX `store_idx` ON `reviews` (`store_id`);--> statement-breakpoint
CREATE INDEX `product_idx` ON `reviews` (`product_id`);--> statement-breakpoint
CREATE INDEX `tacora_idx` ON `reviews` (`tacora_post_id`);--> statement-breakpoint
CREATE INDEX `store_idx` ON `store_gallery_images` (`store_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `stores` (`user_id`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `stores` (`slug`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `stores` (`status`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `stores` (`main_category_id`);--> statement-breakpoint
CREATE INDEX `tacora_idx` ON `tacora_images` (`tacora_post_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `tacora_posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `store_idx` ON `tacora_posts` (`store_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `tacora_posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `tacora_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tacora_posts` (`status`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `lastSignedIn`;