// 中餐常见食物热量数据库（每100克）
export interface FoodItem {
  name: string;
  category: string;
  calories: number;   // 每100g 千卡
  protein?: number;   // g
  fat?: number;       // g
  carbs?: number;     // g
  unit?: string;      // 常用单位描述
  unitGrams?: number; // 常用单位的克数
}

export const foodDatabase: FoodItem[] = [
  // ========== 主食 ==========
  { name: "白米饭", category: "主食", calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9, unit: "碗", unitGrams: 200 },
  { name: "糙米饭", category: "主食", calories: 111, protein: 2.5, fat: 0.9, carbs: 23, unit: "碗", unitGrams: 200 },
  { name: "小米粥", category: "主食", calories: 46, protein: 1.4, fat: 0.7, carbs: 8.4, unit: "碗", unitGrams: 300 },
  { name: "白粥", category: "主食", calories: 46, protein: 1.1, fat: 0.2, carbs: 9.7, unit: "碗", unitGrams: 300 },
  { name: "馒头", category: "主食", calories: 223, protein: 7, fat: 1.1, carbs: 44.2, unit: "个", unitGrams: 100 },
  { name: "花卷", category: "主食", calories: 211, protein: 6.4, fat: 1.5, carbs: 42.4, unit: "个", unitGrams: 100 },
  { name: "全麦面包", category: "主食", calories: 246, protein: 8.5, fat: 3.4, carbs: 44, unit: "片", unitGrams: 35 },
  { name: "白面包", category: "主食", calories: 265, protein: 8, fat: 3.2, carbs: 49, unit: "片", unitGrams: 35 },
  { name: "面条（煮）", category: "主食", calories: 110, protein: 3.6, fat: 0.4, carbs: 23, unit: "碗", unitGrams: 250 },
  { name: "挂面（干）", category: "主食", calories: 346, protein: 10.3, fat: 0.6, carbs: 74.1, unit: "把", unitGrams: 100 },
  { name: "方便面", category: "主食", calories: 473, protein: 8.3, fat: 21.4, carbs: 61.6, unit: "包", unitGrams: 100 },
  { name: "油条", category: "主食", calories: 386, protein: 6.9, fat: 17.6, carbs: 50.1, unit: "根", unitGrams: 60 },
  { name: "包子（猪肉）", category: "主食", calories: 226, protein: 8.5, fat: 8.2, carbs: 30.2, unit: "个", unitGrams: 80 },
  { name: "饺子（猪肉）", category: "主食", calories: 240, protein: 9.3, fat: 10.8, carbs: 25.7, unit: "个", unitGrams: 20 },
  { name: "烧饼", category: "主食", calories: 326, protein: 8.2, fat: 7.1, carbs: 58.3, unit: "个", unitGrams: 100 },
  { name: "粽子", category: "主食", calories: 195, protein: 4.5, fat: 3.5, carbs: 36.5, unit: "个", unitGrams: 150 },
  { name: "玉米（煮）", category: "主食", calories: 112, protein: 4, fat: 1.2, carbs: 22.8, unit: "根", unitGrams: 200 },
  { name: "红薯（烤）", category: "主食", calories: 90, protein: 1.6, fat: 0.1, carbs: 20.7, unit: "个", unitGrams: 200 },
  { name: "土豆（煮）", category: "主食", calories: 81, protein: 2, fat: 0.1, carbs: 17.5, unit: "个", unitGrams: 200 },
  { name: "山药", category: "主食", calories: 57, protein: 1.9, fat: 0.2, carbs: 12.4, unit: "根", unitGrams: 150 },

  // ========== 肉类 ==========
  { name: "鸡胸肉（煮）", category: "肉类", calories: 133, protein: 31, fat: 1.2, carbs: 0, unit: "块", unitGrams: 150 },
  { name: "鸡腿（去骨）", category: "肉类", calories: 181, protein: 20, fat: 11, carbs: 0, unit: "个", unitGrams: 100 },
  { name: "鸡翅", category: "肉类", calories: 194, protein: 17.4, fat: 13.8, carbs: 0, unit: "个", unitGrams: 50 },
  { name: "鸡蛋（煮）", category: "肉类", calories: 155, protein: 13, fat: 11, carbs: 1.1, unit: "个", unitGrams: 60 },
  { name: "鸡蛋（炒）", category: "肉类", calories: 196, protein: 13.3, fat: 14.8, carbs: 2.1, unit: "个", unitGrams: 60 },
  { name: "瘦猪肉（煮）", category: "肉类", calories: 143, protein: 20.3, fat: 6.2, carbs: 1.5, unit: "份", unitGrams: 100 },
  { name: "五花肉（煮）", category: "肉类", calories: 395, protein: 13.5, fat: 37, carbs: 0, unit: "份", unitGrams: 100 },
  { name: "猪排骨", category: "肉类", calories: 264, protein: 18.3, fat: 20.4, carbs: 0, unit: "份", unitGrams: 150 },
  { name: "猪肝", category: "肉类", calories: 129, protein: 19.3, fat: 3.5, carbs: 5, unit: "份", unitGrams: 100 },
  { name: "牛肉（瘦）", category: "肉类", calories: 125, protein: 20.2, fat: 4.2, carbs: 0.2, unit: "份", unitGrams: 100 },
  { name: "牛腩", category: "肉类", calories: 207, protein: 18, fat: 16, carbs: 0, unit: "份", unitGrams: 100 },
  { name: "羊肉（瘦）", category: "肉类", calories: 139, protein: 20.5, fat: 5.5, carbs: 0, unit: "份", unitGrams: 100 },
  { name: "鸭肉（去皮）", category: "肉类", calories: 149, protein: 18.3, fat: 7.5, carbs: 0, unit: "份", unitGrams: 100 },
  { name: "火腿肠", category: "肉类", calories: 212, protein: 14, fat: 10, carbs: 15, unit: "根", unitGrams: 50 },
  { name: "腊肉", category: "肉类", calories: 498, protein: 13, fat: 48, carbs: 5, unit: "片", unitGrams: 30 },
  { name: "午餐肉", category: "肉类", calories: 229, protein: 11.5, fat: 18, carbs: 5.5, unit: "片", unitGrams: 30 },

  // ========== 水产 ==========
  { name: "草鱼（煮）", category: "水产", calories: 113, protein: 16.6, fat: 5.2, carbs: 0, unit: "份", unitGrams: 150 },
  { name: "鲈鱼（蒸）", category: "水产", calories: 105, protein: 18.6, fat: 3.4, carbs: 0, unit: "条", unitGrams: 300 },
  { name: "三文鱼（刺身）", category: "水产", calories: 208, protein: 20.4, fat: 13.4, carbs: 0, unit: "片", unitGrams: 30 },
  { name: "虾仁（煮）", category: "水产", calories: 93, protein: 18.6, fat: 0.8, carbs: 0, unit: "份", unitGrams: 100 },
  { name: "基围虾（白灼）", category: "水产", calories: 87, protein: 18.2, fat: 1.4, carbs: 0, unit: "份", unitGrams: 150 },
  { name: "螃蟹（蒸）", category: "水产", calories: 95, protein: 13.8, fat: 3.6, carbs: 2.3, unit: "只", unitGrams: 150 },
  { name: "带鱼（煎）", category: "水产", calories: 179, protein: 18, fat: 11, carbs: 0, unit: "段", unitGrams: 80 },
  { name: "鱿鱼（烤）", category: "水产", calories: 92, protein: 15.6, fat: 1.6, carbs: 2.2, unit: "份", unitGrams: 100 },
  { name: "蛤蜊（煮）", category: "水产", calories: 62, protein: 10, fat: 0.8, carbs: 2.8, unit: "份", unitGrams: 200 },
  { name: "海带（煮）", category: "水产", calories: 12, protein: 1.2, fat: 0.1, carbs: 2, unit: "份", unitGrams: 100 },
  { name: "紫菜（干）", category: "水产", calories: 164, protein: 26.6, fat: 2.4, carbs: 16.8, unit: "片", unitGrams: 5 },

  // ========== 蔬菜 ==========
  { name: "大白菜", category: "蔬菜", calories: 13, protein: 1.5, fat: 0.1, carbs: 2.2, unit: "份", unitGrams: 200 },
  { name: "小白菜", category: "蔬菜", calories: 15, protein: 1.5, fat: 0.3, carbs: 1.6, unit: "份", unitGrams: 200 },
  { name: "菠菜", category: "蔬菜", calories: 24, protein: 2.6, fat: 0.3, carbs: 2.8, unit: "份", unitGrams: 200 },
  { name: "生菜", category: "蔬菜", calories: 15, protein: 1.3, fat: 0.3, carbs: 1.6, unit: "份", unitGrams: 100 },
  { name: "空心菜", category: "蔬菜", calories: 20, protein: 2.2, fat: 0.2, carbs: 3.6, unit: "份", unitGrams: 200 },
  { name: "西兰花", category: "蔬菜", calories: 36, protein: 4.1, fat: 0.6, carbs: 4.3, unit: "份", unitGrams: 150 },
  { name: "菜花", category: "蔬菜", calories: 24, protein: 2, fat: 0.2, carbs: 4.6, unit: "份", unitGrams: 150 },
  { name: "番茄", category: "蔬菜", calories: 19, protein: 0.9, fat: 0.2, carbs: 3.9, unit: "个", unitGrams: 150 },
  { name: "黄瓜", category: "蔬菜", calories: 15, protein: 0.8, fat: 0.1, carbs: 2.9, unit: "根", unitGrams: 150 },
  { name: "冬瓜", category: "蔬菜", calories: 12, protein: 0.4, fat: 0.2, carbs: 2.6, unit: "份", unitGrams: 200 },
  { name: "茄子", category: "蔬菜", calories: 21, protein: 1.1, fat: 0.2, carbs: 4.3, unit: "根", unitGrams: 150 },
  { name: "胡萝卜", category: "蔬菜", calories: 37, protein: 1, fat: 0.2, carbs: 8.8, unit: "根", unitGrams: 100 },
  { name: "白萝卜", category: "蔬菜", calories: 16, protein: 0.7, fat: 0.1, carbs: 3.4, unit: "份", unitGrams: 200 },
  { name: "芹菜", category: "蔬菜", calories: 14, protein: 0.7, fat: 0.1, carbs: 2.7, unit: "份", unitGrams: 150 },
  { name: "洋葱", category: "蔬菜", calories: 39, protein: 1.1, fat: 0.1, carbs: 9, unit: "个", unitGrams: 150 },
  { name: "青椒", category: "蔬菜", calories: 22, protein: 1, fat: 0.2, carbs: 4.6, unit: "个", unitGrams: 100 },
  { name: "豆角", category: "蔬菜", calories: 31, protein: 2.1, fat: 0.2, carbs: 5.7, unit: "份", unitGrams: 100 },
  { name: "四季豆", category: "蔬菜", calories: 31, protein: 2, fat: 0.3, carbs: 5.5, unit: "份", unitGrams: 100 },
  { name: "豌豆", category: "蔬菜", calories: 105, protein: 7.4, fat: 0.4, carbs: 18.2, unit: "份", unitGrams: 100 },
  { name: "豆芽", category: "蔬菜", calories: 18, protein: 2.1, fat: 0.5, carbs: 1.8, unit: "份", unitGrams: 150 },
  { name: "莲藕", category: "蔬菜", calories: 73, protein: 1.9, fat: 0.2, carbs: 16.4, unit: "节", unitGrams: 150 },
  { name: "竹笋", category: "蔬菜", calories: 19, protein: 2.6, fat: 0.2, carbs: 2.5, unit: "份", unitGrams: 100 },
  { name: "金针菇", category: "蔬菜", calories: 26, protein: 2.4, fat: 0.4, carbs: 3.3, unit: "份", unitGrams: 100 },
  { name: "香菇（鲜）", category: "蔬菜", calories: 20, protein: 2.2, fat: 0.3, carbs: 2.2, unit: "份", unitGrams: 100 },
  { name: "木耳（泡发）", category: "蔬菜", calories: 21, protein: 1.3, fat: 0.2, carbs: 3.6, unit: "份", unitGrams: 100 },
  { name: "秋葵", category: "蔬菜", calories: 33, protein: 2, fat: 0.1, carbs: 4, unit: "份", unitGrams: 100 },
  { name: "苦瓜", category: "蔬菜", calories: 19, protein: 1, fat: 0.1, carbs: 3.5, unit: "根", unitGrams: 150 },
  { name: "丝瓜", category: "蔬菜", calories: 18, protein: 1, fat: 0.1, carbs: 3.6, unit: "根", unitGrams: 150 },

  // ========== 豆制品 ==========
  { name: "豆腐（嫩）", category: "豆制品", calories: 62, protein: 6.2, fat: 2.5, carbs: 2.8, unit: "块", unitGrams: 200 },
  { name: "豆腐（老）", category: "豆制品", calories: 81, protein: 8.1, fat: 3.7, carbs: 3.8, unit: "块", unitGrams: 150 },
  { name: "豆腐干", category: "豆制品", calories: 140, protein: 16.2, fat: 6.5, carbs: 4.5, unit: "块", unitGrams: 50 },
  { name: "千张（百页）", category: "豆制品", calories: 224, protein: 24, fat: 12, carbs: 5, unit: "张", unitGrams: 50 },
  { name: "腐竹（干）", category: "豆制品", calories: 459, protein: 44.6, fat: 21.7, carbs: 21.3, unit: "根", unitGrams: 20 },
  { name: "豆浆（无糖）", category: "豆制品", calories: 31, protein: 3, fat: 1.6, carbs: 0.7, unit: "杯", unitGrams: 300 },
  { name: "豆腐脑", category: "豆制品", calories: 47, protein: 5.3, fat: 1.9, carbs: 1.7, unit: "碗", unitGrams: 300 },
  { name: "毛豆", category: "豆制品", calories: 131, protein: 11.8, fat: 5, carbs: 7.7, unit: "份", unitGrams: 100 },

  // ========== 水果 ==========
  { name: "苹果", category: "水果", calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8, unit: "个", unitGrams: 200 },
  { name: "香蕉", category: "水果", calories: 93, protein: 1.4, fat: 0.2, carbs: 22, unit: "根", unitGrams: 120 },
  { name: "橙子", category: "水果", calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8, unit: "个", unitGrams: 150 },
  { name: "橘子", category: "水果", calories: 43, protein: 0.8, fat: 0.2, carbs: 10.2, unit: "个", unitGrams: 100 },
  { name: "葡萄", category: "水果", calories: 69, protein: 0.7, fat: 0.2, carbs: 18.1, unit: "串", unitGrams: 200 },
  { name: "西瓜", category: "水果", calories: 30, protein: 0.6, fat: 0.1, carbs: 7.6, unit: "块", unitGrams: 300 },
  { name: "哈密瓜", category: "水果", calories: 34, protein: 0.5, fat: 0.1, carbs: 7.9, unit: "块", unitGrams: 200 },
  { name: "草莓", category: "水果", calories: 32, protein: 0.8, fat: 0.2, carbs: 7.7, unit: "份", unitGrams: 150 },
  { name: "蓝莓", category: "水果", calories: 57, protein: 0.7, fat: 0.3, carbs: 14.5, unit: "份", unitGrams: 100 },
  { name: "猕猴桃", category: "水果", calories: 61, protein: 1.1, fat: 0.5, carbs: 14.7, unit: "个", unitGrams: 80 },
  { name: "芒果", category: "水果", calories: 60, protein: 0.8, fat: 0.4, carbs: 15, unit: "个", unitGrams: 200 },
  { name: "梨", category: "水果", calories: 51, protein: 0.4, fat: 0.1, carbs: 13.1, unit: "个", unitGrams: 200 },
  { name: "桃子", category: "水果", calories: 39, protein: 0.9, fat: 0.3, carbs: 8.8, unit: "个", unitGrams: 150 },
  { name: "樱桃", category: "水果", calories: 46, protein: 1.1, fat: 0.2, carbs: 10.6, unit: "份", unitGrams: 100 },
  { name: "荔枝", category: "水果", calories: 66, protein: 0.8, fat: 0.4, carbs: 15.2, unit: "颗", unitGrams: 20 },
  { name: "龙眼", category: "水果", calories: 60, protein: 1.2, fat: 0.1, carbs: 14.1, unit: "颗", unitGrams: 10 },
  { name: "菠萝", category: "水果", calories: 41, protein: 0.5, fat: 0.1, carbs: 10.8, unit: "份", unitGrams: 150 },
  { name: "柚子", category: "水果", calories: 38, protein: 0.7, fat: 0.1, carbs: 9.6, unit: "瓣", unitGrams: 100 },
  { name: "牛油果", category: "水果", calories: 160, protein: 2, fat: 14.7, carbs: 2.5, unit: "个", unitGrams: 100 },
  { name: "火龙果", category: "水果", calories: 55, protein: 1.1, fat: 0.4, carbs: 13, unit: "个", unitGrams: 250 },
  { name: "百香果", category: "水果", calories: 97, protein: 2.2, fat: 0.7, carbs: 23.4, unit: "个", unitGrams: 50 },

  // ========== 奶制品 ==========
  { name: "纯牛奶", category: "奶制品", calories: 54, protein: 3, fat: 3.2, carbs: 3.4, unit: "杯", unitGrams: 250 },
  { name: "脱脂牛奶", category: "奶制品", calories: 34, protein: 3.4, fat: 0.1, carbs: 5, unit: "杯", unitGrams: 250 },
  { name: "酸奶（原味）", category: "奶制品", calories: 72, protein: 3.5, fat: 3.3, carbs: 5.7, unit: "杯", unitGrams: 200 },
  { name: "希腊酸奶", category: "奶制品", calories: 59, protein: 10, fat: 0.7, carbs: 3.6, unit: "杯", unitGrams: 200 },
  { name: "奶酪", category: "奶制品", calories: 328, protein: 25, fat: 23.5, carbs: 3.2, unit: "片", unitGrams: 20 },
  { name: "奶油", category: "奶制品", calories: 379, protein: 2.8, fat: 41, carbs: 1.8, unit: "勺", unitGrams: 15 },
  { name: "炼乳", category: "奶制品", calories: 331, protein: 8.2, fat: 8.7, carbs: 56, unit: "勺", unitGrams: 15 },
  { name: "冰激凌", category: "奶制品", calories: 207, protein: 3.5, fat: 11, carbs: 24, unit: "球", unitGrams: 60 },

  // ========== 蛋类 ==========
  { name: "鸡蛋（煮）", category: "蛋类", calories: 155, protein: 13, fat: 11, carbs: 1.1, unit: "个", unitGrams: 60 },
  { name: "鸡蛋（煎）", category: "蛋类", calories: 209, protein: 13.5, fat: 16, carbs: 1.5, unit: "个", unitGrams: 60 },
  { name: "鸭蛋", category: "蛋类", calories: 180, protein: 12.6, fat: 13, carbs: 3.1, unit: "个", unitGrams: 70 },
  { name: "鹌鹑蛋", category: "蛋类", calories: 160, protein: 12.8, fat: 11.1, carbs: 1.2, unit: "个", unitGrams: 10 },
  { name: "皮蛋", category: "蛋类", calories: 171, protein: 14.3, fat: 10.7, carbs: 4.2, unit: "个", unitGrams: 60 },
  { name: "咸鸭蛋", category: "蛋类", calories: 190, protein: 12.7, fat: 12.6, carbs: 4.2, unit: "个", unitGrams: 60 },

  // ========== 零食及饮品 ==========
  { name: "薯片", category: "零食", calories: 536, protein: 5, fat: 34, carbs: 53, unit: "包", unitGrams: 50 },
  { name: "饼干（普通）", category: "零食", calories: 433, protein: 7.6, fat: 16.3, carbs: 66.5, unit: "片", unitGrams: 10 },
  { name: "奥利奥", category: "零食", calories: 483, protein: 5, fat: 21, carbs: 69, unit: "块", unitGrams: 12 },
  { name: "巧克力", category: "零食", calories: 546, protein: 4.9, fat: 30.8, carbs: 61.5, unit: "块", unitGrams: 20 },
  { name: "辣条", category: "零食", calories: 400, protein: 8, fat: 22, carbs: 42, unit: "包", unitGrams: 30 },
  { name: "坚果混合", category: "零食", calories: 553, protein: 15, fat: 46, carbs: 22, unit: "把", unitGrams: 30 },
  { name: "花生（炒）", category: "零食", calories: 563, protein: 25.8, fat: 44.3, carbs: 19.5, unit: "把", unitGrams: 20 },
  { name: "核桃", category: "零食", calories: 627, protein: 15.2, fat: 65.2, carbs: 6.5, unit: "个", unitGrams: 15 },
  { name: "杏仁", category: "零食", calories: 579, protein: 21.2, fat: 50, carbs: 10.3, unit: "把", unitGrams: 20 },
  { name: "腰果", category: "零食", calories: 553, protein: 18.2, fat: 43.8, carbs: 27, unit: "把", unitGrams: 20 },
  { name: "瓜子（葵花籽）", category: "零食", calories: 616, protein: 22.6, fat: 52.8, carbs: 16.2, unit: "把", unitGrams: 15 },
  { name: "蛋糕（奶油）", category: "零食", calories: 349, protein: 5, fat: 21, carbs: 37, unit: "块", unitGrams: 80 },
  { name: "蛋挞", category: "零食", calories: 302, protein: 5.6, fat: 16.5, carbs: 33, unit: "个", unitGrams: 60 },
  { name: "月饼（莲蓉）", category: "零食", calories: 421, protein: 6, fat: 18, carbs: 60, unit: "个", unitGrams: 100 },

  // ========== 饮料 ==========
  { name: "可乐", category: "饮料", calories: 42, protein: 0, fat: 0, carbs: 10.6, unit: "罐", unitGrams: 330 },
  { name: "雪碧", category: "饮料", calories: 41, protein: 0, fat: 0, carbs: 10.3, unit: "罐", unitGrams: 330 },
  { name: "果汁（橙汁）", category: "饮料", calories: 45, protein: 0.7, fat: 0.1, carbs: 10.4, unit: "杯", unitGrams: 250 },
  { name: "啤酒", category: "饮料", calories: 43, protein: 0.5, fat: 0, carbs: 3.6, unit: "瓶", unitGrams: 330 },
  { name: "白酒（52°）", category: "饮料", calories: 298, protein: 0, fat: 0, carbs: 0, unit: "两", unitGrams: 50 },
  { name: "红酒", category: "饮料", calories: 85, protein: 0.1, fat: 0, carbs: 2.6, unit: "杯", unitGrams: 150 },
  { name: "奶茶（珍珠）", category: "饮料", calories: 80, protein: 1, fat: 2, carbs: 14, unit: "杯", unitGrams: 500 },
  { name: "拿铁咖啡", category: "饮料", calories: 55, protein: 3, fat: 2.5, carbs: 5, unit: "杯", unitGrams: 300 },
  { name: "美式咖啡", category: "饮料", calories: 5, protein: 0.3, fat: 0, carbs: 0.7, unit: "杯", unitGrams: 300 },

  // ========== 调味品及酱料 ==========
  { name: "植物油", category: "调味品", calories: 899, protein: 0, fat: 99.9, carbs: 0, unit: "勺", unitGrams: 10 },
  { name: "芝麻油", category: "调味品", calories: 898, protein: 0, fat: 99.8, carbs: 0, unit: "勺", unitGrams: 5 },
  { name: "黄油", category: "调味品", calories: 717, protein: 0.9, fat: 81, carbs: 0.1, unit: "勺", unitGrams: 10 },
  { name: "白糖", category: "调味品", calories: 387, protein: 0, fat: 0, carbs: 100, unit: "勺", unitGrams: 10 },
  { name: "蜂蜜", category: "调味品", calories: 304, protein: 0.3, fat: 0, carbs: 82, unit: "勺", unitGrams: 15 },
  { name: "番茄酱", category: "调味品", calories: 83, protein: 1.7, fat: 0.2, carbs: 19, unit: "勺", unitGrams: 15 },
  { name: "沙拉酱", category: "调味品", calories: 389, protein: 0.5, fat: 39, carbs: 8, unit: "勺", unitGrams: 15 },
  { name: "花生酱", category: "调味品", calories: 588, protein: 25, fat: 50, carbs: 20, unit: "勺", unitGrams: 15 },
  { name: "老干妈", category: "调味品", calories: 389, protein: 3.5, fat: 35, carbs: 12, unit: "勺", unitGrams: 10 },
  { name: "酱油", category: "调味品", calories: 60, protein: 8, fat: 0, carbs: 5, unit: "勺", unitGrams: 10 },
  { name: "陈醋", category: "调味品", calories: 30, protein: 0.8, fat: 0, carbs: 4, unit: "勺", unitGrams: 10 },

  // ========== 中式菜品 ==========
  { name: "番茄炒蛋", category: "中式菜品", calories: 85, protein: 5.5, fat: 5, carbs: 4, unit: "份", unitGrams: 200 },
  { name: "宫保鸡丁", category: "中式菜品", calories: 160, protein: 12, fat: 10, carbs: 8, unit: "份", unitGrams: 200 },
  { name: "麻婆豆腐", category: "中式菜品", calories: 85, protein: 5, fat: 4, carbs: 5, unit: "份", unitGrams: 200 },
  { name: "红烧肉", category: "中式菜品", calories: 310, protein: 12, fat: 28, carbs: 3, unit: "份", unitGrams: 150 },
  { name: "鱼香肉丝", category: "中式菜品", calories: 145, protein: 10, fat: 8, carbs: 9, unit: "份", unitGrams: 200 },
  { name: "糖醋排骨", category: "中式菜品", calories: 230, protein: 14, fat: 14, carbs: 15, unit: "份", unitGrams: 200 },
  { name: "回锅肉", category: "中式菜品", calories: 290, protein: 12, fat: 24, carbs: 5, unit: "份", unitGrams: 200 },
  { name: "青椒肉丝", category: "中式菜品", calories: 125, protein: 10, fat: 6, carbs: 5, unit: "份", unitGrams: 200 },
  { name: "地三鲜", category: "中式菜品", calories: 120, protein: 2.5, fat: 7, carbs: 13, unit: "份", unitGrams: 200 },
  { name: "干煸四季豆", category: "中式菜品", calories: 110, protein: 3, fat: 7, carbs: 8, unit: "份", unitGrams: 200 },
  { name: "醋溜白菜", category: "中式菜品", calories: 35, protein: 1.5, fat: 1.5, carbs: 3.5, unit: "份", unitGrams: 200 },
  { name: "蚝油生菜", category: "中式菜品", calories: 30, protein: 1.3, fat: 1, carbs: 3, unit: "份", unitGrams: 200 },
  { name: "蒜蓉西兰花", category: "中式菜品", calories: 55, protein: 3, fat: 2, carbs: 6, unit: "份", unitGrams: 200 },
  { name: "清蒸鱼", category: "中式菜品", calories: 100, protein: 16, fat: 3.5, carbs: 0.5, unit: "条", unitGrams: 300 },
  { name: "白灼虾", category: "中式菜品", calories: 85, protein: 17, fat: 1, carbs: 0.5, unit: "份", unitGrams: 200 },
  { name: "水煮鱼", category: "中式菜品", calories: 180, protein: 14, fat: 12, carbs: 3, unit: "份", unitGrams: 300 },
  { name: "水煮肉片", category: "中式菜品", calories: 210, protein: 13, fat: 16, carbs: 3, unit: "份", unitGrams: 250 },
  { name: "酸菜鱼", category: "中式菜品", calories: 110, protein: 12, fat: 5, carbs: 3, unit: "份", unitGrams: 300 },
  { name: "火锅（麻辣）", category: "中式菜品", calories: 120, protein: 8, fat: 8, carbs: 3, unit: "份", unitGrams: 200 },
  { name: "火锅（清汤）", category: "中式菜品", calories: 60, protein: 6, fat: 2, carbs: 2, unit: "份", unitGrams: 200 },
  { name: "炒饭", category: "中式菜品", calories: 185, protein: 5, fat: 7, carbs: 26, unit: "碗", unitGrams: 250 },
  { name: "蛋炒饭", category: "中式菜品", calories: 200, protein: 6, fat: 8, carbs: 27, unit: "碗", unitGrams: 250 },
  { name: "炒面", category: "中式菜品", calories: 185, protein: 6, fat: 7, carbs: 26, unit: "份", unitGrams: 250 },
  { name: "兰州拉面", category: "中式菜品", calories: 110, protein: 5, fat: 2, carbs: 20, unit: "碗", unitGrams: 500 },
  { name: "麻辣烫", category: "中式菜品", calories: 85, protein: 6, fat: 4, carbs: 5, unit: "份", unitGrams: 300 },
  { name: "酸辣粉", category: "中式菜品", calories: 98, protein: 3, fat: 3, carbs: 16, unit: "碗", unitGrams: 300 },
  { name: "螺蛳粉", category: "中式菜品", calories: 115, protein: 4, fat: 5, carbs: 15, unit: "碗", unitGrams: 350 },
  { name: "小笼包", category: "中式菜品", calories: 210, protein: 8, fat: 9, carbs: 25, unit: "笼", unitGrams: 150 },
  { name: "煎饼果子", category: "中式菜品", calories: 210, protein: 7, fat: 8, carbs: 28, unit: "个", unitGrams: 150 },
  { name: "烤鸭（带皮）", category: "中式菜品", calories: 290, protein: 18, fat: 24, carbs: 1, unit: "份", unitGrams: 100 },

  // ========== 汤类 ==========
  { name: "紫菜蛋花汤", category: "汤类", calories: 20, protein: 2, fat: 0.8, carbs: 1.5, unit: "碗", unitGrams: 300 },
  { name: "番茄蛋汤", category: "汤类", calories: 25, protein: 1.5, fat: 1, carbs: 2.5, unit: "碗", unitGrams: 300 },
  { name: "冬瓜排骨汤", category: "汤类", calories: 45, protein: 3.5, fat: 2.5, carbs: 1.5, unit: "碗", unitGrams: 300 },
  { name: "鸡汤（去皮）", category: "汤类", calories: 35, protein: 3, fat: 2, carbs: 1, unit: "碗", unitGrams: 300 },
  { name: "骨头汤", category: "汤类", calories: 55, protein: 3, fat: 4, carbs: 1, unit: "碗", unitGrams: 300 },
  { name: "酸辣汤", category: "汤类", calories: 35, protein: 2, fat: 1.5, carbs: 3.5, unit: "碗", unitGrams: 300 },
  { name: "绿豆汤", category: "汤类", calories: 45, protein: 2.5, fat: 0.2, carbs: 9, unit: "碗", unitGrams: 300 },
  { name: "银耳莲子羹", category: "汤类", calories: 65, protein: 1, fat: 0.2, carbs: 15, unit: "碗", unitGrams: 250 },
];

// 去重后的分类列表
export function getCategories(): string[] {
  return [...new Set(foodDatabase.map(f => f.category))];
}

// 搜索食物
export function searchFoods(query: string, limit = 30): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return foodDatabase.slice(0, limit);
  return foodDatabase
    .filter(f => f.name.toLowerCase().includes(q))
    .slice(0, limit);
}

// 通过分类获取食物
export function getFoodsByCategory(category: string): FoodItem[] {
  return foodDatabase.filter(f => f.category === category);
}

// 计算热量
export function calculateCalories(food: FoodItem, grams: number): number {
  return Math.round((food.calories * grams) / 100);
}
