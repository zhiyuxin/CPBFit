"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { NotificationSettings } from "@/components/NotificationSettings";
import { User, Save, Check, Trash2, Info, LogOut } from "lucide-react";

interface Profile {
  id?: string;
  name?: string;
  heightCm?: number;
  goalKg?: number;
  startKg?: number;
  calorieBudget?: number;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-7 w-16" />
      <div className="glass-card px-5 py-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="skeleton h-12 w-12 rounded-full" />
          <div>
            <div className="skeleton h-5 w-20 mb-1" />
            <div className="skeleton h-3 w-32" />
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="mb-4">
            <div className="skeleton h-3 w-12 mb-1" />
            <div className="skeleton h-11 w-full" />
          </div>
        ))}
        <div className="skeleton h-12 w-full mt-6" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({});
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [start, setStart] = useState("");
  const [calorieBudget, setCalorieBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/profile");
    const data = await res.json();
    setProfile(data);
    setName(data.name || "");
    setHeight(data.heightCm?.toString() || "");
    setGoal(data.goalKg?.toString() || "");
    setStart(data.startKg?.toString() || "");
    setCalorieBudget(data.calorieBudget?.toString() || "");
    setLoading(false);
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
        calorieBudget: calorieBudget || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasData = Object.keys(profile).length > 0 && profile.id;

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-primary tracking-tight page-enter">设置</h1>

      <GlassCard className="page-enter page-enter-d1">
        <div className="flex items-center gap-3 mb-6">
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
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              昵称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="我的名字"
              className="w-full rounded-xl border border-separator/30 bg-bg/50 px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent transition-colors"
            />
          </div>

          {/* Height */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              身高
            </label>
            <div className="flex items-center gap-2 bg-bg/50 rounded-xl border border-separator/30 px-4 py-1 focus-within:border-accent transition-colors">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="165"
                className="flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
              />
              <span className="text-xs text-text-secondary font-medium">cm</span>
            </div>
          </div>

          {/* Goal Weight */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              目标体重
            </label>
            <div className="flex items-center gap-2 bg-bg/50 rounded-xl border border-separator/30 px-4 py-1 focus-within:border-accent transition-colors">
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="60"
                className="flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
              />
              <span className="text-xs text-text-secondary font-medium">kg</span>
            </div>
          </div>

          {/* Start Weight */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              起始体重
            </label>
            <div className="flex items-center gap-2 bg-bg/50 rounded-xl border border-separator/30 px-4 py-1 focus-within:border-accent transition-colors">
              <input
                type="number"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="70"
                className="flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
              />
              <span className="text-xs text-text-secondary font-medium">kg</span>
            </div>
          </div>

          {/* Calorie Budget */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              每日热量预算
            </label>
            <div className="flex items-center gap-2 bg-bg/50 rounded-xl border border-separator/30 px-4 py-1 focus-within:border-accent transition-colors">
              <input
                type="number"
                value={calorieBudget}
                onChange={(e) => setCalorieBudget(e.target.value)}
                placeholder="1800"
                className="flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
              />
              <span className="text-xs text-text-secondary font-medium">kcal</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-base font-semibold text-white transition-all btn-press disabled:opacity-50 disabled:active:scale-100 shadow-sm shadow-accent/20"
          >
            {saving ? (
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : saved ? (
              <Check size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? "保存中..." : saved ? "已保存" : "保存设置"}
          </button>
        </div>
      </GlassCard>

      {/* Notifications */}
      <div className="page-enter page-enter-d2">
        <NotificationSettings />
      </div>

      {/* Account */}
      <GlassCard className="page-enter page-enter-d2">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <User size={18} className="text-accent" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">账户</h2>
            <p className="text-xs text-text-secondary">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-2xl border border-separator/30 py-2.5 text-sm font-semibold text-text-secondary transition-all btn-press flex items-center justify-center gap-2"
        >
          <LogOut size={15} />
          退出登录
        </button>
      </GlassCard>

      {/* About */}
      <GlassCard className="page-enter page-enter-d2">
        <div className="flex items-start gap-3">
          <span className="inline-flex p-1.5 rounded-xl bg-fill mt-0.5">
            <Info size={14} className="text-text-secondary" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-1">关于 WeightTrack</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              优雅的体重管理工具，帮你追踪体重变化趋势，设定减重目标，记录身体数据。使用过程中产生的数据仅保存在本地设备中。
            </p>
            <p className="text-[10px] text-text-tertiary mt-2">v1.0.0</p>
          </div>
        </div>
      </GlassCard>

      {/* Danger Zone */}
      {hasData && (
        <GlassCard className="page-enter page-enter-d3 !border !border-accent-red/15">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex p-1 rounded-lg bg-accent-red/10">
              <Trash2 size={14} className="text-accent-red" />
            </span>
            <h2 className="text-sm font-semibold text-accent-red">危险操作</h2>
          </div>
          <p className="text-xs text-text-secondary mb-3 leading-relaxed">
            删除所有数据后将无法恢复，包括体重记录、身体围度和饮水记录。
          </p>
          <button
            onClick={async () => {
              if (confirm("确定要删除所有数据吗？此操作不可恢复。")) {
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
            className="w-full rounded-2xl border border-accent-red/25 bg-accent-red/5 py-3 text-sm font-semibold text-accent-red transition-all btn-press flex items-center justify-center gap-2"
          >
            <Trash2 size={15} />
            删除所有数据
          </button>
        </GlassCard>
      )}
    </div>
  );
}
