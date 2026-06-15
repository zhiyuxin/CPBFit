"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { User, Ruler, Target, Scale, Save } from "lucide-react";

interface Profile {
  id?: string;
  name?: string;
  heightCm?: number;
  goalKg?: number;
  startKg?: number;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({});
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [start, setStart] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();
    setProfile(data);
    setName(data.name || "");
    setHeight(data.heightCm?.toString() || "");
    setGoal(data.goalKg?.toString() || "");
    setStart(data.startKg?.toString() || "");
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        heightCm: height || null,
        goalKg: goal || null,
        startKg: start || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasData = Object.keys(profile).length > 0 && profile.id;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">设置</h1>

      <GlassCard>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <User size={22} className="text-accent" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              个人资料
            </h2>
            <p className="text-xs text-text-secondary">
              用于计算 BMI 和目标进度
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <User size={14} /> 昵称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="我的名字"
              className="w-full rounded-xl border border-separator/40 bg-transparent px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
            />
          </div>

          {/* Height */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <Ruler size={14} /> 身高
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="165"
                className="flex-1 rounded-xl border border-separator/40 bg-transparent px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
              />
              <span className="text-sm text-text-secondary">cm</span>
            </div>
          </div>

          {/* Goal Weight */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <Target size={14} /> 目标体重
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="60"
                className="flex-1 rounded-xl border border-separator/40 bg-transparent px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
              />
              <span className="text-sm text-text-secondary">kg</span>
            </div>
          </div>

          {/* Start Weight */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
              <Scale size={14} /> 起始体重
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="70"
                className="flex-1 rounded-xl border border-separator/40 bg-transparent px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
              />
              <span className="text-sm text-text-secondary">kg</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-base font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "保存中..." : saved ? "✓ 已保存" : "保存设置"}
          </button>
        </div>
      </GlassCard>

      {/* About */}
      <GlassCard>
        <h2 className="text-base font-semibold text-text-primary mb-2">
          关于
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          WeightTrack 是一个优雅的体重管理工具，帮助你追踪体重变化趋势，设定减重目标，记录身体数据。
        </p>
        <p className="text-xs text-text-tertiary mt-3">
          数据仅存储在本地，不会上传到任何服务器。
        </p>
      </GlassCard>

      {/* Danger Zone */}
      {hasData && (
        <GlassCard>
          <h2 className="text-base font-semibold text-accent-red mb-2">
            数据管理
          </h2>
          <button
            onClick={async () => {
              if (
                confirm("确定要删除所有数据吗？此操作不可恢复。")
              ) {
                // Delete all records
                const records = await fetch("/api/records?days=9999").then(
                  (r) => r.json()
                );
                for (const r of records) {
                  await fetch(`/api/records?id=${r.id}`, {
                    method: "DELETE",
                  });
                }
                window.location.reload();
              }
            }}
            className="w-full rounded-2xl border border-accent-red/30 py-2.5 text-sm font-semibold text-accent-red transition-all active:scale-[0.98]"
          >
            删除所有数据
          </button>
        </GlassCard>
      )}
    </div>
  );
}
