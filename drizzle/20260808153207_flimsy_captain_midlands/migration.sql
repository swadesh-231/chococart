ALTER TABLE "orders" ADD COLUMN "reserved_until" timestamp;--> statement-breakpoint
-- Orders reserved before this column existed hold their stock with no deadline,
-- so the sweep would never reach them. Date each one from when it was last
-- touched: long-abandoned checkouts fall straight into the sweep's sights,
-- while anything reserved moments ago still gets its full window.
UPDATE "orders"
SET "reserved_until" = COALESCE("updated_at", "created_at", CURRENT_TIMESTAMP) + interval '5 minutes'
WHERE "status" = 'reserved' AND "reserved_until" IS NULL;
