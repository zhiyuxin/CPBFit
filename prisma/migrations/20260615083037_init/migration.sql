-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "calorieBudget" REAL;

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL,
    "fat" REAL,
    "carbs" REAL,
    "unit" TEXT DEFAULT '份',
    "unitGrams" REAL DEFAULT 100
);

-- CreateTable
CREATE TABLE "MealRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "mealType" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "grams" REAL NOT NULL,
    "calories" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MealRecord_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "FoodItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MealRecord_userId_date_idx" ON "MealRecord"("userId", "date");

-- CreateIndex
CREATE INDEX "MealRecord_userId_mealType_idx" ON "MealRecord"("userId", "mealType");
