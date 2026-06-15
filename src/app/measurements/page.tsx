"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { formatDateDisplay } from "@/lib/utils";
import { Ruler, Save, Check } from "lucide-react";

interface Measurement {
  id: string;
  date: string;
  waistCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="skeleton h-6 w-6 rounded-full" />
        <div className="skeleton h-7 w-24" />
      </div>
      <div className="glass-card px-5 py-4">
        <div className="skeleton h-5 w-20 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="skeleton h-3 w-8 mb-1" />
              <div className="skeleton h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="skeleton h-12 w-full mt-3" />
      </div>
    </div>
  );
}

export default function MeasurementsPage() {
  const [records, setRecords] = useState<Measurement[]>([]);
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [arm, setArm] = useState("");
  const [thigh, setThigh] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/measurements");
    const data = await res.json();
    setRecords(data.reverse());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waist && !hip && !arm && !thigh) return;

    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    await fetch("/api/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: today,
        waistCm: waist ? parseFloat(waist) : null,
        hipCm: hip ? parseFloat(hip) : null,
        armCm: arm ? parseFloat(arm) : null,
        thighCm: thigh ? parseFloat(thigh) : null,
      }),
    });

    setWaist("");
    setHip("");
    setArm("");
    setThigh("");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    loadRecords();
  };

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 page-enter">
        <span className="inline-flex p-1.5 rounded-xl bg-accent/10">
          <Ruler size={18} className="text-accent" />
        </span>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">身体围度</h1>
      </div>

      <GlassCard className="page-enter page-enter-d1">
        <form onSubmit={handleSave} className="space-y-3">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">①</span>
            记录围度
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "腰围", value: waist, set: setWaist, key: "waist", unit: "cm" },
              { label: "臀围", value: hip, set: setHip, key: "hip", unit: "cm" },
              { label: "臂围", value: arm, set: setArm, key: "arm", unit: "cm" },
              { label: "大腿围", value: thigh, set: setThigh, key: "thigh", unit: "cm" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs text-text-secondary font-medium mb-1.5 block">
                  {field.label}
                </label>
                <div className="flex items-center gap-1 bg-bg/50 rounded-xl border border-separator/30 px-3 py-1 focus-within:border-accent transition-colors">
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder="--"
                    step="0.5"
                    className="w-full bg-transparent py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
                  />
                  <span className="text-xs text-text-secondary font-medium shrink-0">{field.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving || (!waist && !hip && !arm && !thigh)}
            className="w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-white transition-all btn-press disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? "保存中..." : saved ? "已保存" : "保存"}
          </button>
        </form>
      </GlassCard>

      {records.length === 0 ? (
        <GlassCard className="page-enter page-enter-d2">
          <div className="flex flex-col items-center py-10 text-text-tertiary">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-fill mb-3">
              <Ruler size={22} className="text-text-tertiary" />
            </div>
            <p className="text-sm font-medium">还没有记录</p>
            <p className="text-xs mt-1">记录你的身体围度数据</p>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="page-enter page-enter-d2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text-primary">历史记录</h2>
            <span className="text-xs text-text-secondary bg-fill px-2 py-0.5 rounded-full">{records.length} 条</span>
          </div>
          <div className="space-y-1">
            {records.slice(0, 20).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2.5 border-b border-separator/10 last:border-0"
              >
                <span className="text-sm font-medium text-text-primary">
                  {formatDateDisplay(r.date)}
                </span>
                <div className="flex gap-3 text-xs text-text-secondary">
                  {r.waistCm && (
                    <span className="bg-fill px-2 py-0.5 rounded-md font-medium">
                      腰<span className="text-text-primary ml-0.5">{r.waistCm}</span>
                    </span>
                  )}
                  {r.hipCm && (
                    <span className="bg-fill px-2 py-0.5 rounded-md font-medium">
                      臀<span className="text-text-primary ml-0.5">{r.hipCm}</span>
                    </span>
                  )}
                  {r.armCm && (
                    <span className="bg-fill px-2 py-0.5 rounded-md font-medium">
                      臂<span className="text-text-primary ml-0.5">{r.armCm}</span>
                    </span>
                  )}
                  {r.thighCm && (
                    <span className="bg-fill px-2 py-0.5 rounded-md font-medium">
                      腿<span className="text-text-primary ml-0.5">{r.thighCm}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
