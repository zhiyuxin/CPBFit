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

export default function Home() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [water, setWater] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
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

  const totalLoss =
    profile.startKg && currentWeight != null
      ? Math.round((currentWeight - profile.startKg) * 10) / 10
      : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {formatDateDisplay(today)}
          </h1>
          <p className="text-sm text-text-secondary">{getWeekday(today)}</p>
        </div>
        {currentWeight && (
          <div className="text-right">
            <p className="text-3xl font-bold text-text-primary">
              {currentWeight.toFixed(1)}
              <span className="text-base font-normal text-text-secondary ml-1">
                kg
              </span>
            </p>
            {weightDiff !== null && weightDiff !== 0 && (
              <p
                className={`flex items-center gap-0.5 text-xs font-medium justify-end ${
                  weightDiff < 0 ? "text-accent-green" : "text-accent-red"
                }`}
              >
                {weightDiff < 0 ? (
                  <TrendingDown size={12} />
                ) : (
                  <TrendingUp size={12} />
                )}
                {Math.abs(weightDiff).toFixed(1)} kg
                {weightDiff < 0 ? " ↓" : " ↑"}
              </p>
            )}
            {weightDiff === 0 && (
              <p className="flex items-center gap-0.5 text-xs font-medium text-text-secondary justify-end">
                <Minus size={12} /> 持平
              </p>
            )}
          </div>
        )}
      </div>

      {/* Goal Progress Ring */}
      {goalProgress !== null && (
        <GlassCard className="flex flex-col items-center py-6">
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
              <p className="text-2xl font-bold text-text-primary">
                {Math.round(goalProgress * 100)}%
              </p>
              <p className="text-xs text-text-secondary">目标进度</p>
            </div>
          </ProgressRing>
          <div className="mt-3 flex gap-6 text-center text-xs text-text-secondary">
            {profile.goalKg && (
              <div>
                <p className="font-semibold text-text-primary">
                  {profile.goalKg} kg
                </p>
                <p>目标</p>
              </div>
            )}
            {totalLoss !== null && (
              <div>
                <p className="font-semibold text-accent-green">
                  {totalLoss > 0 ? "+" : ""}
                  {totalLoss.toFixed(1)} kg
                </p>
                <p>变化</p>
              </div>
            )}
            {profile.startKg && (
              <div>
                <p className="font-semibold text-text-primary">
                  {profile.startKg} kg
                </p>
                <p>起始</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Weight Input */}
      <WeightInput
        initialWeight={todayRecord?.weightKg}
        initialNote={todayRecord?.note}
        onSave={handleSave}
        saving={saving}
      />

      {/* Water Intake */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-accent-blue" />
            <h2 className="text-base font-semibold text-text-primary">
              饮水记录
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleWater(-1)}
              disabled={water <= 0}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-text-primary active:scale-90 transition-transform disabled:opacity-30"
            >
              −
            </button>
            <span className="w-12 text-center text-lg font-bold text-accent-blue">
              {water}
            </span>
            <button
              onClick={() => handleWater(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue active:scale-90 transition-transform"
            >
              +
            </button>
            <span className="text-sm text-text-secondary ml-1">杯</span>
          </div>
        </div>
      </GlassCard>

      {/* BMI Card */}
      {bmi !== null && bmiCategory && (
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">BMI</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                身高 {profile.heightCm} cm
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{bmi}</p>
              <p
                className="text-xs font-medium"
                style={{ color: bmiCategory.color }}
              >
                {bmiCategory.label}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Chart */}
      {records.length > 0 && <WeightChart data={records} />}
    </div>
  );
}
