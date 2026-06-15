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

  return (
    <GlassCard>
      <form onSubmit={handleSubmit}>
        <h2 className="mb-4 text-base font-semibold text-text-primary">
          记录体重
        </h2>

        <div className="mb-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-separator/40 bg-transparent px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            max={today}
          />
        </div>

        <div className="mb-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => adjustWeight(-0.1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-fill text-text-primary active:scale-95 transition-transform"
          >
            <Minus size={18} />
          </button>
          <div className="relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="体重"
              step="0.1"
              min="20"
              max="300"
              className="w-32 rounded-2xl bg-accent/10 px-4 py-3 text-center text-2xl font-bold text-accent outline-none"
              required
            />
            <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary">
              kg
            </span>
          </div>
          <button
            type="button"
            onClick={() => adjustWeight(0.1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-fill text-text-primary active:scale-95 transition-transform"
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
            className="w-full rounded-xl border border-separator/40 bg-transparent px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !weight || !date}
          className="w-full rounded-2xl bg-accent py-3 text-base font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {saving ? "保存中..." : initialWeight ? "更新记录" : "✓ 记录体重"}
        </button>
      </form>
    </GlassCard>
  );
}
