"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { GlassCard } from "@/components/GlassCard";
import {
  Scale,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
} from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error")) {
        setError("邮箱或密码错误");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "注册失败");
          setLoading(false);
          return;
        }
      }

      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/",
      });
    } catch {
      setError("操作失败，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center px-5 overflow-y-auto">
      {/* Logo — compact */}
      <div className="flex flex-col items-center mb-6 shrink-0">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-3">
          <Scale size={26} className="text-accent" />
        </span>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          WeightTrack
        </h1>
        <p className="text-xs text-text-secondary mt-1">优雅的体重管理</p>
      </div>

      {/* Card */}
      <GlassCard className="w-full max-w-sm !py-5 !px-5">
        {/* Mode tabs */}
        <div className="flex bg-fill rounded-2xl p-1 mb-5">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              mode === "login"
                ? "bg-white text-text-primary shadow-sm"
                : "text-text-secondary"
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              mode === "register"
                ? "bg-white text-text-primary shadow-sm"
                : "text-text-secondary"
            }`}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="text-[11px] font-semibold text-text-secondary mb-1 block">
                昵称
              </label>
              <div className="flex items-center gap-2.5 bg-bg/50 rounded-xl border border-separator/25 px-3.5 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/8 transition-all">
                <User size={14} className="text-text-tertiary shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的名字"
                  className="flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-text-secondary mb-1 block">
              邮箱
            </label>
            <div className="flex items-center gap-2.5 bg-bg/50 rounded-xl border border-separator/25 px-3.5 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/8 transition-all">
              <Mail size={14} className="text-text-tertiary shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-text-secondary mb-1 block">
              密码
            </label>
            <div className="flex items-center gap-2.5 bg-bg/50 rounded-xl border border-separator/25 px-3.5 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/8 transition-all">
              <Lock size={14} className="text-text-tertiary shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "至少6位密码" : "输入密码"}
                className="flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-tertiary hover:text-text-secondary transition-colors shrink-0"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-accent-red/8 rounded-xl px-3 py-2">
              <p className="text-xs font-medium text-accent-red text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-white btn-press disabled:opacity-50 shadow-md shadow-accent/20 mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                处理中...
              </span>
            ) : mode === "login" ? (
              "登录"
            ) : (
              "注册并登录"
            )}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
