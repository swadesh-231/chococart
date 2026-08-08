ALTER TABLE "products" ADD COLUMN "cocoa_percent" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "flavour_notes" text[];--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "origin" varchar(60);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "weight_grams" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "vegan" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "gluten_free" boolean DEFAULT false NOT NULL;