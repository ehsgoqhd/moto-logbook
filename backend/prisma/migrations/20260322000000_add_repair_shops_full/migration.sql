-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'PREMIUM', 'DIESEL', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "MaintenanceCategory" AS ENUM ('OIL_CHANGE', 'OIL_FILTER', 'AIR_FILTER', 'TIRE_FRONT', 'TIRE_REAR', 'BRAKE_PAD', 'BRAKE_FLUID', 'CHAIN', 'SPARK_PLUG', 'BATTERY', 'COOLANT', 'SUSPENSION', 'VALVE', 'BELT', 'INSPECTION', 'RECALL', 'REPAIR', 'CLEANING', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('INSURANCE', 'REGISTRATION', 'TAX', 'PARKING', 'TOLL', 'ACCESSORIES', 'GEAR', 'WASH', 'STORAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('MILEAGE', 'DATE', 'BOTH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "refreshToken" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motorcycles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "engineCC" INTEGER,
    "plateNumber" TEXT,
    "vin" TEXT,
    "color" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchaseMileage" INTEGER NOT NULL DEFAULT 0,
    "currentMileage" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motorcycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_records" (
    "id" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mileage" INTEGER NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "pricePerLiter" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "fullTank" BOOLEAN NOT NULL DEFAULT true,
    "station" TEXT,
    "fuelType" "FuelType" NOT NULL DEFAULT 'GASOLINE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "shopId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "mileage" INTEGER NOT NULL,
    "category" "MaintenanceCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shop" TEXT,
    "nextMileage" INTEGER,
    "nextDate" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_records" (
    "id" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "category" "MaintenanceCategory",
    "targetMileage" INTEGER,
    "intervalMileage" INTEGER,
    "targetDate" TIMESTAMP(3),
    "repeatDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "maintenanceRecordId" TEXT,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_shops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "phone" TEXT,
    "kakaoMapUrl" TEXT,
    "description" TEXT,
    "businessHours" TEXT,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" TEXT NOT NULL DEFAULT 'user',
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_specialties" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "shop_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorite_shops" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_reviews" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_slots" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "slotDate" TIMESTAMP(3) NOT NULL,
    "slotTime" TEXT NOT NULL,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "currentBookings" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "reservation_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_reservations" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "memo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "motorcycles_userId_idx" ON "motorcycles"("userId");

-- CreateIndex
CREATE INDEX "fuel_records_motorcycleId_date_idx" ON "fuel_records"("motorcycleId", "date");

-- CreateIndex
CREATE INDEX "maintenance_records_motorcycleId_date_idx" ON "maintenance_records"("motorcycleId", "date");

-- CreateIndex
CREATE INDEX "maintenance_records_motorcycleId_category_idx" ON "maintenance_records"("motorcycleId", "category");

-- CreateIndex
CREATE INDEX "maintenance_records_shopId_idx" ON "maintenance_records"("shopId");

-- CreateIndex
CREATE INDEX "expense_records_motorcycleId_date_idx" ON "expense_records"("motorcycleId", "date");

-- CreateIndex
CREATE INDEX "reminders_motorcycleId_isActive_idx" ON "reminders"("motorcycleId", "isActive");

-- CreateIndex
CREATE INDEX "photos_motorcycleId_idx" ON "photos"("motorcycleId");

-- CreateIndex
CREATE INDEX "photos_maintenanceRecordId_idx" ON "photos"("maintenanceRecordId");

-- CreateIndex
CREATE INDEX "repair_shops_lat_lng_idx" ON "repair_shops"("lat", "lng");

-- CreateIndex
CREATE INDEX "repair_shops_isRecommended_idx" ON "repair_shops"("isRecommended");

-- CreateIndex
CREATE INDEX "shop_specialties_shopId_idx" ON "shop_specialties"("shopId");

-- CreateIndex
CREATE INDEX "user_favorite_shops_userId_idx" ON "user_favorite_shops"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_shops_userId_shopId_key" ON "user_favorite_shops"("userId", "shopId");

-- CreateIndex
CREATE INDEX "shop_reviews_shopId_idx" ON "shop_reviews"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_reviews_shopId_userId_key" ON "shop_reviews"("shopId", "userId");

-- CreateIndex
CREATE INDEX "reservation_slots_shopId_slotDate_idx" ON "reservation_slots"("shopId", "slotDate");

-- CreateIndex
CREATE INDEX "shop_reservations_shopId_idx" ON "shop_reservations"("shopId");

-- CreateIndex
CREATE INDEX "shop_reservations_userId_idx" ON "shop_reservations"("userId");

-- CreateIndex
CREATE INDEX "shop_reservations_slotId_idx" ON "shop_reservations"("slotId");

-- AddForeignKey
ALTER TABLE "motorcycles" ADD CONSTRAINT "motorcycles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_records" ADD CONSTRAINT "fuel_records_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "motorcycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "motorcycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "repair_shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_records" ADD CONSTRAINT "expense_records_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "motorcycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "motorcycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "motorcycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_maintenanceRecordId_fkey" FOREIGN KEY ("maintenanceRecordId") REFERENCES "maintenance_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_specialties" ADD CONSTRAINT "shop_specialties_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "repair_shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_shops" ADD CONSTRAINT "user_favorite_shops_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_shops" ADD CONSTRAINT "user_favorite_shops_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "repair_shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_reviews" ADD CONSTRAINT "shop_reviews_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "repair_shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_reviews" ADD CONSTRAINT "shop_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_slots" ADD CONSTRAINT "reservation_slots_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "repair_shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_reservations" ADD CONSTRAINT "shop_reservations_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "repair_shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_reservations" ADD CONSTRAINT "shop_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_reservations" ADD CONSTRAINT "shop_reservations_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "reservation_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_reservations" ADD CONSTRAINT "shop_reservations_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "motorcycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

