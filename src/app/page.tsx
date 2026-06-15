"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { WeightInput } from "@/components/WeightInput";
import { WeightChart } from "@/components/WeightChart";
import { ProgressRing } from "@/components/ProgressRing";
import {
  calculateBMI,
  getBMICategory,
  formatDateDisplay,
  getWeekday,
} from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus, Droplets } from "lucide-react";

interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
  note?: string;
}

interface Profile {
  heightCm?: number;
  goalKg?: number;
  startKg?: number;
  name?: string;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton h-7 w-24 mb-1" />
          <div className="skeleton h-4 w-16" />
        </div>
        <div className="text-right">
          <div className="skeleton h-8 w-20 mb-1 ml-auto" />
          <div className="skeleton h-3 w-14 ml-auto" />
        </div>
      </div>
      <div className="glass-card px-5 py-4">
        <div className="skeleton h-12 w-full mb-3" />
        <div className="skeleton h-16 w-full mb-3" />
        <div className="skeleton h-12 w-full" />
      </div>
      <div className="glass-card px-5 py-4">
        <div className="skeleton h-5 w-20" />
      </div>
    </div>
  );
}

export default function Home() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [water, setWater] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recRes, profRes, waterRes] = await Promise.all([
        fetch("/api/records?days=90"),
        fetch("/api/profile"),
        fetch("/api/water"),
      ]);
      const recData = await recRes.json();
      const profData = await profRes.json();
      const waterData = await waterRes.json();
      setRecords(recData);
      setProfile(profData);

      const today = new Date().toISOString().split("T")[0];
      const todayWater = waterData.find(
        (w: any) => w.date.split("T")[0] === today
      );
      setWater(todayWater?.cups || 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (data: {
    date: string;
    weightKg: number;
    note?: string;
  }) => {
    setSaving(true);
    await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await loadData();
    setSaving(false);
  };

  const handleWater = async (delta: number) => {
    const newCups = Math.max(0, water + delta);
    setWater(newCups);
    const today = new Date().toISOString().split("T")[0];
    await fetch("/api/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, cups: newCups }),
    });
  };

  if (loading) return <Skeleton />;

  const today = new Date().toISOString().split("T")[0];
  const todayRecord = records.find((r) => r.date.split("T")[0] === today);
  const latestRecord = records[records.length - 1];
  const currentWeight = todayRecord?.weightKg || latestRecord?.weightKg;

  const latestWeight = latestRecord?.weightKg;
  const prevWeight = records.length > 1 ? records[records.length - 2]?.weightKg : null;
  const weightDiff = latestWeight && prevWeight ? latestWeight - prevWeight : null;

  const bmi =
    profile.heightCm && currentWeight
      ? calculateBMI(currentWeight, profile.heightCm)
      : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const goalProgress =
    profile.startKg && profile.goalKg && currentWeight != null
      ? Math.min(
          1,
          Math.max(
            0,
            (profile.startKg - currentWeight) /
              Math.max(0.1, profile.startKg - profile.goalKg)
          )
        )
      : null;

  const totalChange =
    profile.startKg && currentWeight != null
      ? Math.round((currentWeight - profile.startKg) * 10) / 10
      : null;

  return (
    <div className="space-y-4">
      {/* Apple-style Header */}
      <div className="flex items-center justify-between page-enter">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {formatDateDisplay(today)}
          </h1>
          <p className="text-sm text-text-secondary">{getWeekday(today)}</p>
        </div>
        {currentWeight && (
          <div className="text-right">
            <p className="text-3xl font-bold text-text-primary tracking-tight">
              {currentWeight.toFixed(1)}
              <span className="text-base font-normal text-text-secondary ml-1 font-medium">
                kg
              </span>
            </p>
            {weightDiff !== null && weightDiff !== 0 && (
              <p
                className={`flex items-center gap-0.5 text-xs font-semibold justify-end ${
                  weightDiff < 0 ? "text-accent-green" : "text-accent-red"
                }`}
              >
                <span className={`inline-flex p-0.5 rounded-full ${weightDiff < 0 ? "bg-accent-green/15" : "bg-accent-red/15"}`}>
                  {weightDiff < 0 ? (
                    <TrendingDown size={10} />
                  ) : (
                    <TrendingUp size={10} />
                  )}
                </span>
                {Math.abs(weightDiff).toFixed(1)} kg{" "}
                {weightDiff < 0 ? "下降" : "上升"}
              </p>
            )}
            {weightDiff === 0 && (
              <p className="flex items-center gap-0.5 text-xs font-medium text-text-secondary justify-end">
                <Minus size={10} /> 持平
              </p>
            )}
          </div>
        )}
      </div>

      {/* Goal Progress Ring */}
      {goalProgress !== null && (
        <GlassCard className="flex flex-col items-center py-6 page-enter page-enter-d1">
          <ProgressRing
            progress={goalProgress}
            size={140}
            strokeWidth={10}
            color={
              goalProgress >= 1
                ? "var(--accent-green)"
                : "var(--accent-blue)"
            }
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary tracking-tight">
                {Math.round(goalProgress * 100)}%
              </p>
              <p className="text-xs text-text-secondary">目标进度</p>
            </div>
          </ProgressRing>
          <div className="mt-3 flex gap-6 text-center text-xs text-text-secondary">
            {profile.goalKg && (
              <div>
                <p className="font-semibold text-text-primary text-sm">
                  {profile.goalKg} kg
                </p>
                <p className="mt-0.5">目标</p>
              </div>
            )}
            {totalChange !== null && (
              <div>
                <p
                  className={`font-semibold text-sm ${
                    totalChange < 0 ? "text-accent-green" : totalChange > 0 ? "text-accent-red" : "text-text-primary"
                  }`}
                >
                  {totalChange > 0 ? "+" : ""}
                  {totalChange.toFixed(1)} kg
                </p>
                <p className="mt-0.5">变化</p>
              </div>
            )}
            {profile.startKg && (
              <div>
                <p className="font-semibold text-text-primary text-sm">
                  {profile.startKg} kg
                </p>
                <p className="mt-0.5">起始</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Weight Input */}
      <div className="page-enter page-enter-d2">
        <WeightInput
          initialWeight={todayRecord?.weightKg}
          initialNote={todayRecord?.note}
          onSave={handleSave}
          saving={saving}
        />
      </div>

      {/* Water Intake */}
      <GlassCard className="page-enter page-enter-d2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex p-1.5 rounded-full bg-accent-blue/10">
              <Droplets size={16} className="text-accent-blue" />
            </span>
            <h2 className="text-base font-semibold text-text-primary">
              饮水记录
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleWater(-1)}
              disabled={water <= 0}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-text-primary btn-press disabled:opacity-30 disabled:active:scale-100"
              aria-label="减少一杯"
            >
              −
            </button>
            <div className="relative min-w-[3rem] text-center">
              <span className="text-xl font-bold text-accent-blue">
                {water}
              </span>
              <span className="text-xs text-text-secondary ml-0.5">杯</span>
            </div>
            <button
              onClick={() => handleWater(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue btn-press"
              aria-label="增加一杯"
            >
              +
            </button>
          </div>
        </div>
      </GlassCard>

      {/* BMI Card */}
      {bmi !== null && bmiCategory && (
        <GlassCard className="page-enter page-enter-d3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: `${bmiCategory.color}15` }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: bmiCategory.color }}
                >
                  BMI
                </span>
              </span>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  {bmiCategory.label}
                </h2>
                <p className="text-xs text-text-secondary">
                  身高 {profile.heightCm} cm · {bmi}
                </p>
              </div>
            </div>
            <div
              className="text-lg font-bold"
              style={{ color: bmiCategory.color }}
            >
              {bmi}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Chart */}
      {records.length > 0 && (
        <div className="page-enter page-enter-d4">
          <WeightChart data={records} />
        </div>
      )}
    </div>
  );
}
