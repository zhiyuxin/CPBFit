"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { formatDateDisplay, formatDate } from "@/lib/utils";
import {
  Search,
  Plus,
  X,
  Trash2,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Flame,
  ChevronRight,
} from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  unit?: string;
  unitGrams?: number;
}

interface MealRecord {
  id: string;
  date: string;
  mealType: string;
  foodId: string;
  grams: number;
  calories: number;
  food: FoodItem;
}

interface Profile {
  calorieBudget?: number;
}

const mealTypeLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  breakfast: { label: "早餐", icon: Coffee, color: "text-accent-orange" },
  lunch: { label: "午餐", icon: Sun, color: "text-accent" },
  dinner: { label: "晚餐", icon: Moon, color: "text-accent-purple" },
  snack: { label: "加餐", icon: Cookie, color: "text-accent-pink" },
};

export default function DietPage() {
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [grams, setGrams] = useState("100");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);

  const today = formatDate(new Date());

  const loadMeals = useCallback(async () => {
    const res = await fetch(`/api/meals?date=${today}`);
    const data = await res.json();
    setMeals(data);
  }, [today]);

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();
    setProfile(data);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadMeals(), loadProfile()]);
    setLoading(false);
  }, [loadMeals, loadProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const searchFoods = useCallback(async (q: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (!q.trim() && selectedCategory) params.set("category", selectedCategory);
    const res = await fetch(`/api/foods?${params}`);
    const data = await res.json();
    setFoods(data);
  }, [selectedCategory]);

  // Load categories on mount
  useEffect(() => {
    fetch("/api/foods?categories=true")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchFoods(search), 200);
    return () => clearTimeout(timer);
  }, [search, searchFoods]);

  const handleAddMeal = async () => {
    if (!selectedFood || !grams) return;

    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: today,
        mealType,
        foodId: selectedFood.id,
        grams: parseFloat(grams),
      }),
    });

    setSelectedFood(null);
    setGrams("100");
    setSearch("");
    setShowPanel(false);
    loadMeals();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/meals?id=${id}`, { method: "DELETE" });
    loadMeals();
  };

  // Group meals by type
  const groupedMeals = meals.reduce(
    (acc, meal) => {
      if (!acc[meal.mealType]) acc[meal.mealType] = [];
      acc[meal.mealType].push(meal);
      return acc;
    },
    {} as Record<string, MealRecord[]>
  );

  // Calculate totals
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const budget = profile.calorieBudget || 1800;
  const remaining = budget - totalCalories;
  const progress = Math.min(1, totalCalories / budget);

  const mealOrder = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between page-enter">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">饮食记录</h1>
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="inline-flex items-center gap-1 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white btn-press"
        >
          <Plus size={16} />
          添加
        </button>
      </div>

      {/* Calorie Budget Ring */}
      <GlassCard className="page-enter page-enter-d1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex p-1.5 rounded-lg bg-accent-orange/10">
              <Flame size={16} className="text-accent-orange" />
            </span>
            <span className="text-sm font-semibold text-text-primary">今日热量</span>
          </div>
          <span className="text-sm text-text-secondary">
            {totalCalories} / {budget} kcal
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-fill rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress > 0.9 ? "bg-accent-red" : progress > 0.7 ? "bg-accent-orange" : "bg-accent-green"
            }`}
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs text-text-secondary">
          <span>
            {remaining > 0
              ? `还可摄入 ${remaining} kcal`
              : `超标 ${Math.abs(remaining)} kcal`}
          </span>
          <span>{Math.round(progress * 100)}%</span>
        </div>

        {/* Macro summary */}
        {meals.length > 0 && (
          <div className="flex gap-4 mt-3 pt-3 border-t border-separator/20 text-[10px] text-text-tertiary">
            <span>
              蛋白质{" "}
              {Math.round(meals.reduce((s, m) => s + (m.food.protein || 0) * m.grams / 100, 0))}g
            </span>
            <span>
              脂肪{" "}
              {Math.round(meals.reduce((s, m) => s + (m.food.fat || 0) * m.grams / 100, 0))}g
            </span>
            <span>
              碳水{" "}
              {Math.round(meals.reduce((s, m) => s + (m.food.carbs || 0) * m.grams / 100, 0))}g
            </span>
          </div>
        )}
      </GlassCard>

      {/* Add Food Panel */}
      {showPanel && (
        <GlassCard className="page-enter !px-4 !py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">添加食物</h2>
            <button onClick={() => { setShowPanel(false); setSelectedFood(null); }} className="text-text-tertiary btn-press">
              <X size={18} />
            </button>
          </div>

          {/* Meal type selector */}
          <div className="flex gap-1 bg-fill rounded-xl p-0.5 mb-3">
            {(Object.entries(mealTypeLabels) as [string, typeof mealTypeLabels["breakfast"]][]).map(([key, val]) => {
              const Icon = val.icon;
              const isActive = mealType === key;
              return (
                <button
                  key={key}
                  onClick={() => setMealType(key as typeof mealType)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? "bg-white text-text-primary shadow-sm"
                      : "text-text-secondary"
                  }`}
                >
                  <Icon size={12} />
                  {val.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索食物..."
              className="w-full rounded-xl bg-bg/50 border border-separator/30 pl-9 pr-3 py-2 text-sm text-text-primary outline-none focus:border-accent placeholder:text-text-tertiary"
            />
          </div>

          {/* Food list or selected food */}
          {selectedFood ? (
            <div>
              <div className="flex items-center justify-between bg-accent/5 rounded-xl px-3 py-2 mb-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{selectedFood.name}</p>
                  <p className="text-xs text-text-secondary">{selectedFood.calories} kcal/100g</p>
                </div>
                <button onClick={() => setSelectedFood(null)} className="text-text-tertiary">
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-bg/50 rounded-xl border border-separator/30 px-3 py-1 flex items-center">
                  <input
                    type="number"
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    className="flex-1 bg-transparent py-2 text-sm text-text-primary outline-none text-center"
                    min="1"
                  />
                  <span className="text-xs text-text-secondary">g</span>
                </div>
                <span className="text-sm font-bold text-accent-orange shrink-0">
                  ≈ {Math.round((selectedFood.calories * parseFloat(grams || "0")) / 100)} kcal
                </span>
              </div>
              <button
                onClick={handleAddMeal}
                className="w-full rounded-2xl bg-accent py-2.5 text-sm font-semibold text-white btn-press"
              >
                添加到 {mealTypeLabels[mealType]?.label || "餐"}
              </button>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {foods.slice(0, 20).map((food) => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelectedFood(food);
                    setSelectedCategory("");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-fill/50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{food.name}</p>
                    <p className="text-[10px] text-text-tertiary">{food.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-text-secondary">{food.calories}</p>
                    <p className="text-[10px] text-text-tertiary">kcal/100g</p>
                  </div>
                </button>
              ))}

              {/* Category pills when no search */}
              {!search && !selectedCategory && foods.length === 0 && (
                <div className="py-2 space-y-2">
                  <p className="text-[10px] text-text-tertiary font-medium px-2">
                    按分类浏览：
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-separator/30 bg-card text-text-secondary hover:border-accent/30 hover:text-accent transition-all"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Show foods for selected category */}
              {!search && selectedCategory && foods.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-xs text-text-tertiary">该分类暂无数据</p>
                </div>
              )}

              {/* Back to categories button */}
              {!search && selectedCategory && (
                <button
                  onClick={() => { setSelectedCategory(""); setFoods([]); }}
                  className="w-full text-xs text-accent text-center py-2 font-medium"
                >
                  ← 返回分类列表
                </button>
              )}

              {search && foods.length === 0 && (
                <p className="text-xs text-text-tertiary text-center py-4">没有找到 "{search}"</p>
              )}
              {!search && !selectedCategory && foods.length === 0 && !categories.length && (
                <p className="text-xs text-text-tertiary text-center py-4">输入食物名称搜索</p>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* Meal Groups */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i}>
                <div className="skeleton h-5 w-16 mb-3" />
                <div className="skeleton h-12 w-full" />
              </GlassCard>
            ))}
          </div>
        ) : meals.length === 0 ? (
          <GlassCard>
            <div className="flex flex-col items-center py-8 text-text-tertiary">
              <Cookie size={24} className="mb-2" />
              <p className="text-sm font-medium">今天还没有饮食记录</p>
              <p className="text-xs mt-1">点击右上角"添加"开始记录</p>
            </div>
          </GlassCard>
        ) : (
          mealOrder.map((type) => {
            const typeMeals = groupedMeals[type];
            if (!typeMeals?.length) return null;
            const mt = mealTypeLabels[type];

            return (
              <GlassCard key={type} className="page-enter">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <mt.icon size={15} className={mt.color} />
                    <h2 className="text-sm font-semibold text-text-primary">{mt.label}</h2>
                  </div>
                  <span className="text-xs font-semibold text-text-secondary">
                    {typeMeals.reduce((s, m) => s + m.calories, 0)} kcal
                  </span>
                </div>
                <div className="space-y-1">
                  {typeMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-fill/30 transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {meal.food.name}
                        </span>
                        <span className="text-[10px] text-text-tertiary shrink-0">
                          {meal.grams}g
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-accent-orange">
                          {meal.calories}
                        </span>
                        <button
                          onClick={() => handleDelete(meal.id)}
                          className="opacity-0 group-hover:opacity-100 text-accent-red/60 hover:text-accent-red transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
