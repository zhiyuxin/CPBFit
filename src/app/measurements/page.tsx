"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { formatDateDisplay } from "@/lib/utils";
import { Ruler } from "lucide-react";

interface Measurement {
  id: string;
  date: string;
  waistCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
}

export default function MeasurementsPage() {
  const [records, setRecords] = useState<Measurement[]>([]);
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [arm, setArm] = useState("");
  const [thigh, setThigh] = useState("");

  const loadRecords = useCallback(async () => {
    const res = await fetch("/api/measurements");
    const data = await res.json();
    setRecords(data.reverse());
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waist && !hip && !arm && !thigh) return;

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
    loadRecords();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Ruler size={20} className="text-accent" />
        <h1 className="text-2xl font-bold text-text-primary">身体围度</h1>
      </div>

      <GlassCard>
        <form onSubmit={handleSave} className="space-y-3">
          <h2 className="text-base font-semibold text-text-primary">
            记录围度
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "腰围", value: waist, set: setWaist, key: "waist" },
              { label: "臀围", value: hip, set: setHip, key: "hip" },
              { label: "臂围", value: arm, set: setArm, key: "arm" },
              { label: "大腿围", value: thigh, set: setThigh, key: "thigh" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs text-text-secondary mb-1 block">
                  {field.label}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder="--"
                    step="0.5"
                    className="w-full rounded-xl border border-separator/40 bg-transparent px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
                  />
                  <span className="text-xs text-text-secondary">cm</span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-accent py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98]"
          >
            保存
          </button>
        </form>
      </GlassCard>

      {records.length > 0 && (
        <GlassCard>
          <h2 className="text-base font-semibold text-text-primary mb-3">
            历史记录
          </h2>
          <div className="space-y-2">
            {records.slice(0, 20).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-1.5 border-b border-separator/20 last:border-0"
              >
                <span className="text-sm text-text-primary">
                  {formatDateDisplay(r.date)}
                </span>
                <div className="flex gap-3 text-xs text-text-secondary">
                  {r.waistCm && <span>腰 {r.waistCm}</span>}
                  {r.hipCm && <span>臀 {r.hipCm}</span>}
                  {r.armCm && <span>臂 {r.armCm}</span>}
                  {r.thighCm && <span>腿 {r.thighCm}</span>}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
