"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Target,
  MoveRight,
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

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-7 w-24" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card px-5 py-4">
            <div className="skeleton h-8 w-8 rounded-full mb-3" />
            <div className="skeleton h-6 w-16 mb-1" />
            <div className="skeleton h-3 w-10" />
          </div>
        ))}
      </div>
      <div className="glass-card px-5 py-4">
        <div className="skeleton h-5 w-24 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-6 w-full mb-2" />
        ))}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [recRes, profRes] = await Promise.all([
      fetch("/api/records?days=365"),
      fetch("/api/profile"),
    ]);
    setRecords(await recRes.json());
    setProfile(await profRes.json());
    setLoading(false);
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

  if (loading) return <Skeleton />;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (!stats) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">统计数据</h1>
        <GlassCard>
          <div className="flex flex-col items-center py-10 text-text-tertiary">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-fill mb-3">
              <TrendingDown size={22} />
            </div>
            <p className="text-sm font-medium">数据不足</p>
            <p className="text-xs mt-1">至少需要 2 条记录才能生成统计</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  const statCards = [
    {
      icon: TrendingDown,
      color: stats.totalChange < 0 ? "text-accent-green" : stats.totalChange > 0 ? "text-accent-red" : "text-text-secondary",
      bg: stats.totalChange < 0 ? "bg-accent-green/10" : stats.totalChange > 0 ? "bg-accent-red/10" : "bg-fill",
      label: "总变化",
      value: `${stats.totalChange > 0 ? "+" : ""}${stats.totalChange.toFixed(1)} kg`,
      sub: `${stats.daysDiff} 天`,
    },
    {
      icon: Zap,
      color: stats.avgRatePerWeek < 0 ? "text-accent-green" : "text-accent-red",
      bg: stats.avgRatePerWeek < 0 ? "bg-accent-green/10" : "bg-accent-red/10",
      label: "周均变化",
      value: `${stats.avgRatePerWeek > 0 ? "+" : ""}${stats.avgRatePerWeek.toFixed(2)}`,
      sub: "kg/周",
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
      color: stats.goalRemaining !== null && stats.goalRemaining <= 0 ? "text-accent-green" : "text-accent-orange",
      bg: stats.goalRemaining !== null && stats.goalRemaining <= 0 ? "bg-accent-green/10" : "bg-accent-orange/10",
      label: "距目标",
      value:
        stats.goalRemaining !== null
          ? stats.goalRemaining > 0
            ? `${stats.goalRemaining.toFixed(1)} kg`
            : "🎉 已达标"
          : "未设定",
      sub:
        stats.daysToGoal !== null
          ? `还需 ${stats.daysToGoal} 天`
          : null,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-primary tracking-tight page-enter">统计数据</h1>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => (
          <GlassCard
            key={card.label}
            className={`flex flex-col gap-2 page-enter page-enter-d${i + 1}`}
            style={{ animationDelay: `${0.05 * i}s` }}
          >
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${card.bg}`}>
              <card.icon size={16} className={card.color} />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary tracking-tight">{card.value}</p>
              <p className="text-xs text-text-secondary font-medium">{card.label}</p>
              {card.sub && (
                <p className="text-[10px] text-text-tertiary mt-0.5">{card.sub}</p>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Weekly Averages */}
      <GlassCard className="page-enter page-enter-d3">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex p-1 rounded-lg bg-fill">
            <Calendar size={14} className="text-text-secondary" />
          </span>
          <h2 className="text-base font-semibold text-text-primary">周平均值</h2>
          <span className="text-[10px] text-text-tertiary ml-auto">
            近 {Math.min(stats.weeklyAverages.length, 12)} 周
          </span>
        </div>
        <div className="space-y-1">
          {[...stats.weeklyAverages].reverse().slice(0, 12).map((week, i) => {
            const prevAvg = i < stats.weeklyAverages.length - 1
              ? stats.weeklyAverages[stats.weeklyAverages.length - 2 - i]?.avg
              : null;
            const weekChange = prevAvg
              ? Math.round((week.avg - prevAvg) * 100) / 100
              : null;
            const isPositive = weekChange !== null && weekChange > 0;
            const isNegative = weekChange !== null && weekChange < 0;

            return (
              <div
                key={week.week}
                className="flex items-center justify-between py-2 border-b border-separator/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-text-tertiary min-w-[2.5rem]">
                    {new Date(week.week).getMonth() + 1}月
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-text-primary">
                      {week.avg.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-text-tertiary">kg</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {weekChange !== null && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                        isNegative
                          ? "text-accent-green bg-accent-green/8"
                          : isPositive
                          ? "text-accent-red bg-accent-red/8"
                          : "text-text-tertiary bg-fill"
                      }`}
                    >
                      {isNegative && <TrendingDown size={10} />}
                      {isPositive && <TrendingUp size={10} />}
                      {weekChange > 0 ? "+" : ""}
                      {weekChange.toFixed(2)}
                    </span>
                  )}
                  <span className="text-[10px] text-text-tertiary font-medium min-w-[1.5rem] text-right">
                    {week.count}次
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Best / Worst Week */}
      <div className="grid grid-cols-2 gap-3 page-enter page-enter-d4">
        {stats.bestWeek && (
          <GlassCard className="relative overflow-hidden">
            <span className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-accent-green/5" />
            <p className="text-xs text-accent-green font-semibold mb-1 flex items-center gap-1">
              <Award size={12} /> 最佳周
            </p>
            <p className="text-lg font-bold text-text-primary tracking-tight">
              {stats.bestWeek.change.toFixed(2)} kg
            </p>
            <p className="text-[10px] text-text-tertiary mt-0.5">
              {formatDate(stats.bestWeek.week)} 当周
            </p>
          </GlassCard>
        )}
        {stats.worstWeek && (
          <GlassCard className="relative overflow-hidden">
            <span className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-accent-red/5" />
            <p className="text-xs text-accent-red font-semibold mb-1 flex items-center gap-1">
              <MoveRight size={12} /> 最差周
            </p>
            <p className="text-lg font-bold text-text-primary tracking-tight">
              {stats.worstWeek.change > 0 ? "+" : ""}
              {stats.worstWeek.change.toFixed(2)} kg
            </p>
            <p className="text-[10px] text-text-tertiary mt-0.5">
              {formatDate(stats.worstWeek.week)} 当周
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
