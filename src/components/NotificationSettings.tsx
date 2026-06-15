"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "./GlassCard";
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Clock, MessageSquare, Repeat } from "lucide-react";

interface NotificationItem {
  id: string;
  enabled: boolean;
  hour: number;
  minute: number;
  title: string;
  body: string;
  repeatCount: number;
}

const defaultMessages = [
  "该记录今天的体重了 💪",
  "记得喝水哦 💧",
  "今天运动了吗？🏃",
  "记录一下今天的饮食 🍽️",
  "坚持就是胜利！加油！✨",
  "称一下体重，看看今天的成果 📊",
];

export function NotificationSettings() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newHour, setNewHour] = useState("20");
  const [newMinute, setNewMinute] = useState("00");
  const [newBody, setNewBody] = useState(defaultMessages[0]);
  const [newRepeat, setNewRepeat] = useState("1");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    setSaving(true);
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hour: parseInt(newHour),
        minute: parseInt(newMinute),
        body: newBody,
        repeatCount: parseInt(newRepeat),
        enabled: true,
      }),
    });
    setSaving(false);
    setShowAdd(false);
    load();
  };

  const handleToggle = async (item: NotificationItem) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, enabled: !item.enabled }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    load();
  };

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        alert("需要允许通知权限才能使用推送功能。请在浏览器地址栏左侧点击🔒或ℹ️图标，找到「通知」并改为允许。");
      }
    } else {
      alert("当前浏览器不支持推送通知功能");
    }
  };

  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-orange/10">
              <Bell size={18} className="text-accent-orange" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">推送通知</h2>
              <p className="text-xs text-text-secondary">定时提醒，帮助你坚持记录</p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="text-[10px] text-accent underline underline-offset-2"
          >
            授权通知
          </button>
        </div>

        {/* Notification list */}
        <div className="space-y-2">
          {notifications.length === 0 && (
            <p className="text-xs text-text-tertiary text-center py-3">还没有设置通知</p>
          )}
          {notifications.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-fill/50"
            >
              <button
                onClick={() => handleToggle(item)}
                className="shrink-0"
              >
                {item.enabled ? (
                  <ToggleRight size={22} className="text-accent-green" />
                ) : (
                  <ToggleLeft size={22} className="text-text-tertiary" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-text-tertiary shrink-0" />
                  <span className="text-sm font-bold text-text-primary">
                    {formatTime(item.hour, item.minute)}
                  </span>
                  {item.repeatCount > 0 && (
                    <span className="text-[10px] text-text-tertiary flex items-center gap-0.5">
                      <Repeat size={10} /> ×{item.repeatCount}
                    </span>
                  )}
                  {item.repeatCount === 0 && (
                    <span className="text-[10px] text-text-tertiary flex items-center gap-0.5">
                      <Repeat size={10} /> 无限
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 truncate ${item.enabled ? "text-text-secondary" : "text-text-tertiary"}`}>
                  {item.body}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-accent-red/50 hover:text-accent-red shrink-0 btn-press"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add button */}
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full mt-3 rounded-xl border border-dashed border-separator/40 py-2.5 text-sm text-text-secondary btn-press flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            添加通知
          </button>
        ) : (
          <div className="mt-3 space-y-3 pt-3 border-t border-separator/20">
            {/* Time picker */}
            <div className="flex items-center gap-3">
              <Clock size={14} className="text-text-tertiary shrink-0" />
              <div className="flex items-center gap-1 bg-bg/50 rounded-xl border border-separator/30 px-3 py-1">
                <select
                  value={newHour}
                  onChange={(e) => setNewHour(e.target.value)}
                  className="bg-transparent text-sm font-bold text-text-primary outline-none appearance-none"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                  ))}
                </select>
                <span className="text-text-secondary font-bold">:</span>
                <select
                  value={newMinute}
                  onChange={(e) => setNewMinute(e.target.value)}
                  className="bg-transparent text-sm font-bold text-text-primary outline-none appearance-none"
                >
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
                    (m) => <option key={m} value={m}>{m}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquare size={14} className="text-text-tertiary" />
                <span className="text-xs text-text-secondary">通知内容</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {defaultMessages.map((msg) => (
                  <button
                    key={msg}
                    onClick={() => setNewBody(msg)}
                    className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                      newBody === msg
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-separator/30 text-text-tertiary"
                    }`}
                  >
                    {msg}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="自定义通知内容"
                className="w-full rounded-xl border border-separator/30 bg-bg/50 px-3 py-2 text-xs text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
              />
            </div>

            {/* Repeat count */}
            <div className="flex items-center gap-3">
              <Repeat size={14} className="text-text-tertiary shrink-0" />
              <select
                value={newRepeat}
                onChange={(e) => setNewRepeat(e.target.value)}
                className="flex-1 bg-bg/50 rounded-xl border border-separator/30 px-3 py-2 text-sm text-text-primary outline-none"
              >
                <option value="1">每天提醒，共 1 次</option>
                <option value="3">每天提醒，共 3 次</option>
                <option value="7">每天提醒，共 7 次</option>
                <option value="30">每天提醒，共 30 次</option>
                <option value="0">每天提醒，无限次</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-xl border border-separator/30 py-2 text-xs font-semibold text-text-secondary btn-press"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !newBody}
                className="flex-1 rounded-xl bg-accent py-2 text-xs font-semibold text-white btn-press disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-text-tertiary mt-3 leading-relaxed">
          💡 提示：请先点击「授权通知」允许通知权限。通知会在你设定时间的前后 30 秒内推送。页面需要在后台保持打开（不必须在前台）。
        </p>
      </GlassCard>
    </div>
  );
}
