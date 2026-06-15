import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { foodDatabase } from "../src/data/foods";

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db",
  });

  const prisma = new PrismaClient({ adapter });

  console.log("🌱 开始播种食物数据库...");

  for (const food of foodDatabase) {
    await prisma.foodItem.create({
      data: {
        name: food.name,
        category: food.category,
        calories: food.calories,
        protein: food.protein ?? null,
        fat: food.fat ?? null,
        carbs: food.carbs ?? null,
        unit: food.unit ?? "份",
        unitGrams: food.unitGrams ?? 100,
      },
    });
  }

  console.log(`✅ 成功导入 ${foodDatabase.length} 种食物`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
