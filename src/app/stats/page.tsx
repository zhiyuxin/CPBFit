"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Calendar,
  Award,
  Zap,
  Target,
} from "lucide-react";

interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
}

interface Profile {
  heightCm?: number;
  goalKg?: number;
  startKg?: number;
}

export default function StatsPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [profile, setProfile] = useState<Profile>({});

  const loadData = useCallback(async () => {
    const [recRes, profRes] = await Promise.all([
      fetch("/api/records?days=365"),
      fetch("/api/profile"),
    ]);
    setRecords(await recRes.json());
    setProfile(await profRes.json());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    if (records.length < 2) return null;

    const first = records[0];
    const last = records[records.length - 1];
    const totalChange = last.weightKg - first.weightKg;
    const daysDiff = Math.max(
      1,
      Math.round(
        (new Date(last.date).getTime() - new Date(first.date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    const avgRatePerWeek = (totalChange / daysDiff) * 7;

    // Weekly averages
    const weeklyMap = new Map<string, number[]>();
    records.forEach((r) => {
      const d = new Date(r.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      if (!weeklyMap.has(key)) weeklyMap.set(key, []);
      weeklyMap.get(key)!.push(r.weightKg);
    });
    const weeklyAverages = Array.from(weeklyMap.entries())
      .map(([week, weights]) => ({
        week,
        avg: weights.reduce((a, b) => a + b, 0) / weights.length,
        count: weights.length,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Best week
    let bestWeek: { week: string; change: number } | null = null;
    let worstWeek: { week: string; change: number } | null = null;
    for (let i = 1; i < weeklyAverages.length; i++) {
      const change = weeklyAverages[i].avg - weeklyAverages[i - 1].avg;
      if (!bestWeek || change < bestWeek.change)
        bestWeek = { week: weeklyAverages[i].week, change };
      if (!worstWeek || change > worstWeek.change)
        worstWeek = { week: weeklyAverages[i].week, change };
    }

    // Min / Max
    const minWeight = Math.min(...records.map((r) => r.weightKg));
    const maxWeight = Math.max(...records.map((r) => r.weightKg));
    const minRecord = records.find((r) => r.weightKg === minWeight);
    const maxRecord = records.find((r) => r.weightKg === maxWeight);

    // Goal remaining
    const goalRemaining =
      profile.goalKg && last.weightKg
        ? Math.round((last.weightKg - profile.goalKg) * 10) / 10
        : null;

    // Days to goal at current rate
    const daysToGoal =
      goalRemaining && goalRemaining > 0 && avgRatePerWeek < 0
        ? Math.ceil(Math.abs(goalRemaining / Math.abs(avgRatePerWeek)) * 7)
        : null;

    return {
      totalChange,
      daysDiff,
      avgRatePerWeek,
      weeklyAverages,
      bestWeek,
      worstWeek,
      minWeight,
      maxWeight,
      minRecord,
      maxRecord,
      goalRemaining,
      daysToGoal,
      latestWeight: last.weightKg,
      totalRecords: records.length,
    };
  }, [records, profile]);

  if (!stats) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">统计数据</h1>
        <GlassCard>
          <p className="text-center text-text-secondary py-8">
            至少需要 2 条记录才能生成统计
          </p>
        </GlassCard>
      </div>
    );
  }

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const statCards = [
    {
      icon: TrendingDown,
      color: "text-accent-green",
      bg: "bg-accent-green/10",
      label: "总变化",
      value: `${stats.totalChange > 0 ? "+" : ""}${stats.totalChange.toFixed(1)} kg`,
      sub: `${stats.daysDiff} 天`,
    },
    {
      icon: Zap,
      color: stats.avgRatePerWeek < 0 ? "text-accent-green" : "text-accent-red",
      bg: stats.avgRatePerWeek < 0 ? "bg-accent-green/10" : "bg-accent-red/10",
      label: "周均变化",
      value: `${stats.avgRatePerWeek > 0 ? "+" : ""}${stats.avgRatePerWeek.toFixed(2)} kg/周`,
      sub: null,
    },
    {
      icon: Award,
      color: "text-accent-green",
      bg: "bg-accent-green/10",
      label: "最低体重",
      value: `${stats.minWeight.toFixed(1)} kg`,
      sub: stats.minRecord ? formatDate(stats.minRecord.date) : "",
    },
    {
      icon: Target,
      color: "text-accent-orange",
      bg: "bg-accent-orange/10",
      label: "距目标",
      value:
        stats.goalRemaining !== null
          ? stats.goalRemaining > 0
            ? `${stats.goalRemaining.toFixed(1)} kg`
            : "🎉 已达标"
          : "未设定",
      sub:
        stats.daysToGoal !== null
          ? `预计还需 ${stats.daysToGoal} 天`
          : null,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">统计数据</h1>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card) => (
          <GlassCard key={card.label} className="flex flex-col gap-2">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${card.bg}`}>
              <card.icon size={16} className={card.color} />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">{card.value}</p>
              <p className="text-xs text-text-secondary">{card.label}</p>
              {card.sub && (
                <p className="text-[10px] text-text-tertiary mt-0.5">{card.sub}</p>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Weekly Averages */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-text-secondary" />
          <h2 className="text-base font-semibold text-text-primary">周平均值</h2>
        </div>
        <div className="space-y-2">
          {[...stats.weeklyAverages].reverse().slice(0, 12).map((week, i) => {
            const prevAvg = i < stats.weeklyAverages.length - 1
              ? stats.weeklyAverages[stats.weeklyAverages.length - 2 - i]?.avg
              : null;
            const weekChange = prevAvg
              ? Math.round((week.avg - prevAvg) * 100) / 100
              : null;

            return (
              <div
                key={week.week}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-secondary min-w-[24px]">
                    {new Date(week.week).getMonth() + 1}月
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {week.avg.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {weekChange !== null && weekChange !== 0 && (
                    <span
                      className={`text-xs font-medium ${
                        weekChange < 0
                          ? "text-accent-green"
                          : "text-accent-red"
                      }`}
                    >
                      {weekChange > 0 ? "+" : ""}
                      {weekChange.toFixed(2)}
                    </span>
                  )}
                  <span className="text-[10px] text-text-tertiary">
                    {week.count}次
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Best / Worst Week */}
      <div className="grid grid-cols-2 gap-3">
        {stats.bestWeek && (
          <GlassCard>
            <p className="text-xs text-accent-green font-medium mb-1">最佳周</p>
            <p className="text-sm font-bold text-text-primary">
              {stats.bestWeek.change.toFixed(2)} kg
            </p>
            <p className="text-[10px] text-text-tertiary">
              {formatDate(stats.bestWeek.week)} 当周
            </p>
          </GlassCard>
        )}
        {stats.worstWeek && (
          <GlassCard>
            <p className="text-xs text-accent-red font-medium mb-1">最差周</p>
            <p className="text-sm font-bold text-text-primary">
              {stats.worstWeek.change > 0 ? "+" : ""}
              {stats.worstWeek.change.toFixed(2)} kg
            </p>
            <p className="text-[10px] text-text-tertiary">
              {formatDate(stats.worstWeek.week)} 当周
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
