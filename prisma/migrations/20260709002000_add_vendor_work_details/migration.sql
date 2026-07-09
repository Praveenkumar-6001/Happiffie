ALTER TABLE "Portfolio" ADD COLUMN "eventDate" TIMESTAMP(3);
ALTER TABLE "Portfolio" ADD COLUMN "location" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "clientName" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "guestCount" INTEGER;
ALTER TABLE "Portfolio" ADD COLUMN "budgetRange" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "services" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Portfolio" ADD COLUMN "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[];
