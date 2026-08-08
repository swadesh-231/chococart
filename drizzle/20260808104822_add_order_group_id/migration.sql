ALTER TABLE "orders" ADD COLUMN "group_id" varchar(36);--> statement-breakpoint
CREATE INDEX "orders_group_id_idx" ON "orders" ("group_id");