"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { formatDateDisplay, getWeekday } from "@/lib/utils";
import { Trash2, Edit3, X, Check, AlertTriangle } from "lucide-react";

interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
  note?: string;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="skeleton h-7 w-24" />
        <div className="skeleton h-4 w-16" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="glass-card px-5 py-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="skeleton h-4 w-20 mb-1" />
            <div className="skeleton h-3 w-32" />
          </div>
          <div className="skeleton h-6 w-12" />
        </div>
      ))}
    </div>
  );
}

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/30 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card px-6 py-5 max-w-xs w-full !rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center text-center mb-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-red/10 mb-3">
            <AlertTriangle size={20} className="text-accent-red" />
          </span>
          <h3 className="text-base font-semibold text-text-primary">确认删除</h3>
          <p className="text-sm text-text-secondary mt-1">删除后无法恢复，确定要删除这条记录吗？</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-fill py-2.5 text-sm font-semibold text-text-primary btn-press"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-accent-red py-2.5 text-sm font-semibold text-white btn-press"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editNote, setEditNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/records?days=365");
    const data = await res.json();
    setRecords(data.reverse());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/records?id=${id}`, { method: "DELETE" });
    setDeleteTarget(null);
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

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between page-enter">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">历史记录</h1>
        <span className="text-sm text-text-secondary bg-fill px-3 py-1 rounded-full font-medium">
          {records.length} 条
        </span>
      </div>

      {records.length === 0 && (
        <GlassCard>
          <div className="flex flex-col items-center py-10 text-text-tertiary">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-fill mb-3">
              <Edit3 size={22} className="text-text-tertiary" />
            </div>
            <p className="text-sm font-medium">还没有记录</p>
            <p className="text-xs mt-1">去首页记录第一条体重吧</p>
          </div>
        </GlassCard>
      )}

      <div className="space-y-2">
        {records.map((record, index) => {
          const isEditing = editing === record.id;
          const prevRecord = records[index + 1];
          const diff = prevRecord
            ? Math.round((record.weightKg - prevRecord.weightKg) * 100) / 100
            : null;

          return (
            <GlassCard
              key={record.id}
              className={`flex items-center gap-3 ${
                !isEditing ? "btn-press" : ""
              }`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold text-text-primary">
                    {formatDateDisplay(record.date)}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {getWeekday(record.date)}
                  </p>
                </div>
                {record.note && !isEditing && (
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {record.note}
                  </p>
                )}
                {isEditing && (
                  <div className="mt-1">
                    <input
                      type="text"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="备注"
                      className="w-full rounded-lg bg-fill px-2 py-1 text-xs text-text-primary outline-none"
                    />
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 bg-fill rounded-xl px-2 py-1">
                    <input
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-14 bg-transparent text-center text-sm font-bold text-accent outline-none"
                      step="0.1"
                    />
                    <span className="text-[10px] text-text-secondary font-medium">kg</span>
                  </div>
                  <button
                    onClick={() => handleEdit(record.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-green/15 text-accent-green btn-press"
                    aria-label="确认编辑"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-text-secondary btn-press"
                    aria-label="取消编辑"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-text-primary tracking-tight">
                      {record.weightKg.toFixed(1)}
                    </p>
                    {diff !== null && diff !== 0 && (
                      <p
                        className={`text-[11px] font-semibold ${
                          diff < 0 ? "text-accent-green" : "text-accent-red"
                        }`}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(1)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => startEdit(record)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-text-secondary btn-press"
                      aria-label="编辑"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(record.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-red/10 text-accent-red btn-press"
                      aria-label="删除"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirm
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
