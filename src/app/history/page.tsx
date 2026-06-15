"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { formatDateDisplay, getWeekday } from "@/lib/utils";
import { Trash2, Edit3, X, Check } from "lucide-react";

interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
  note?: string;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editNote, setEditNote] = useState("");

  const loadRecords = useCallback(async () => {
    const res = await fetch("/api/records?days=365");
    const data = await res.json();
    setRecords(data.reverse());
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/records?id=${id}`, { method: "DELETE" });
    loadRecords();
  };

  const handleEdit = async (id: string) => {
    if (!editWeight) return;
    const record = records.find((r) => r.id === id);
    await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: record?.date.split("T")[0],
        weightKg: parseFloat(editWeight),
        note: editNote || undefined,
      }),
    });
    setEditing(null);
    loadRecords();
  };

  const startEdit = (record: WeightRecord) => {
    setEditing(record.id);
    setEditWeight(record.weightKg.toString());
    setEditNote(record.note || "");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">历史记录</h1>
        <p className="text-sm text-text-secondary">{records.length} 条记录</p>
      </div>

      {records.length === 0 && (
        <GlassCard>
          <p className="text-center text-text-secondary py-8">
            还没有记录，去首页记录第一条吧
          </p>
        </GlassCard>
      )}

      <div className="space-y-2">
        {records.map((record) => {
          const isEditing = editing === record.id;
          const prevRecord = records[records.indexOf(record) + 1];
          const diff = prevRecord
            ? Math.round((record.weightKg - prevRecord.weightKg) * 100) / 100
            : null;

          return (
            <GlassCard key={record.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-medium text-text-primary">
                    {formatDateDisplay(record.date)}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {getWeekday(record.date)}
                  </p>
                </div>
                {record.note && (
                  <p className="text-xs text-text-secondary mt-0.5">
                    {record.note}
                  </p>
                )}
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-16 rounded-lg bg-fill px-2 py-1 text-center text-sm font-bold text-accent outline-none"
                      step="0.1"
                    />
                    <span className="text-xs text-text-secondary">kg</span>
                  </div>
                  <button
                    onClick={() => handleEdit(record.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-green/10 text-accent-green"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-fill text-text-secondary"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-text-primary">
                      {record.weightKg.toFixed(1)}
                    </p>
                    {diff !== null && diff !== 0 && (
                      <p
                        className={`text-xs font-medium ${
                          diff < 0 ? "text-accent-green" : "text-accent-red"
                        }`}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(1)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(record)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-text-secondary active:scale-90 transition-transform"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-red/10 text-accent-red active:scale-90 transition-transform"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
