ALTER TABLE "donations" ADD COLUMN "sampleImageId" TEXT;
ALTER TABLE "donations" ADD CONSTRAINT "donation_sample_image_choice" CHECK (
  "sampleImageId" IS NULL OR "sampleImageId" IN ('packed-meals', 'meal-trays')
);
