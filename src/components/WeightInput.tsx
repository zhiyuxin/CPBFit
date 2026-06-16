"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface WeightInputProps {
  initialWeight?: number;
  initialNote?: string;
  initialDate?: string;
  onSave: (data: { date: string; weightKg: number; note?: string }) => void;
  saving?: boolean;
}

export function WeightInput({
  initialWeight,
  initialNote,
  initialDate,
  onSave,
  saving,
}: WeightInputProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(initialDate || today);
  const [weight, setWeight] = useState(
    initialWeight ? initialWeight.toString() : ""
  );
  const [note, setNote] = useState(initialNote || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !date) return;
    onSave({
      date,
      weightKg: parseFloat(weight),
      note: note || undefined,
    });
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const next = Math.max(20, Math.min(300, current + delta));
    setWeight(next.toFixed(1));
  };

  const hasData = !!initialWeight;

  return (
    <GlassCard className="overflow-hidden relative">
      {/* Accent top border when has data */}
      {hasData && (
        <span className="absolute top-0 left-4 right-4 h-0.5 bg-accent rounded-full" />
      )}

      <form onSubmit={handleSubmit}>
        <h2 className="mb-4 text-base font-semibold text-text-primary flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
            {hasData ? "✓" : "①"}
          </span>
          {hasData ? "更新体重" : "记录体重"}
        </h2>

        <div className="mb-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-separator/40 bg-bg/50 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
            max={today}
          />
        </div>

        <div className="mb-4 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => adjustWeight(-0.1)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-fill text-text-primary btn-press shadow-sm"
            aria-label="减 0.1 kg"
          >
            <Minus size={18} />
          </button>
          <div className="relative flex items-center">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="体重"
              step="0.1"
              min="20"
              max="300"
              className="w-40 rounded-2xl bg-accent/8 pr-10 pl-4 py-3.5 text-center text-3xl font-bold text-accent outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(0,122,255,0.2)]"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary pointer-events-none">
              kg
            </span>
          </div>
          <button
            type="button"
            onClick={() => adjustWeight(0.1)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-fill text-text-primary btn-press shadow-sm"
            aria-label="加 0.1 kg"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="备注（可选）"
            className="w-full rounded-xl border border-separator/40 bg-bg/50 px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !weight || !date}
          className="w-full rounded-2xl bg-accent py-3.5 text-base font-semibold text-white transition-all btn-press disabled:opacity-40 disabled:active:scale-100 shadow-sm shadow-accent/20"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              保存中...
            </span>
          ) : hasData ? (
            "✓ 更新记录"
          ) : (
            "记录体重"
          )}
        </button>
      </form>
    </GlassCard>
  );
}
