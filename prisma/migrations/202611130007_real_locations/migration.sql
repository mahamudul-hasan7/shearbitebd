ALTER TABLE donations ADD COLUMN "pickupLatitude" DOUBLE PRECISION, ADD COLUMN "pickupLongitude" DOUBLE PRECISION;
ALTER TABLE food_requests ADD COLUMN "deliveryLatitude" DOUBLE PRECISION, ADD COLUMN "deliveryLongitude" DOUBLE PRECISION;
ALTER TABLE claims ADD COLUMN "deliveryAddressSnapshot" JSONB;

-- Existing rescue records have no confirmed coordinate snapshot. Leave them unmapped.
ALTER TABLE donations ADD CONSTRAINT donation_pickup_coordinates CHECK (
  ("pickupLatitude" IS NULL AND "pickupLongitude" IS NULL) OR
  ("pickupLatitude" IS NOT NULL AND "pickupLongitude" IS NOT NULL AND "pickupLatitude" BETWEEN -90 AND 90 AND "pickupLongitude" BETWEEN -180 AND 180)
);
ALTER TABLE food_requests ADD CONSTRAINT request_delivery_coordinates CHECK (
  ("deliveryLatitude" IS NULL AND "deliveryLongitude" IS NULL) OR
  ("deliveryLatitude" IS NOT NULL AND "deliveryLongitude" IS NOT NULL AND "deliveryLatitude" BETWEEN -90 AND 90 AND "deliveryLongitude" BETWEEN -180 AND 180)
);
