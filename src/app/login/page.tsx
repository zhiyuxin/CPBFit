"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { GlassCard } from "@/components/GlassCard";
import { Scale, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Show error from failed login redirect
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

      // signIn with redirect: true = full form POST, page navigates away.
      // On error the server redirects back to /login?error=... (handled by useEffect above).
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/",
      });
    } catch {
      // Only reached on unexpected error (not wrong password)
      setError("操作失败，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 mb-4">
          <Scale size={32} className="text-accent" />
        </span>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          WeightTrack
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          优雅的体重管理工具
        </p>
      </div>

      <GlassCard className="w-full max-w-sm">
        {/* Tab switcher */}
        <div className="flex bg-fill rounded-xl p-0.5 mb-6">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === "login"
                ? "bg-white text-text-primary shadow-sm dark:bg-card"
                : "text-text-secondary"
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === "register"
                ? "bg-white text-text-primary shadow-sm dark:bg-card"
                : "text-text-secondary"
            }`}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                昵称
              </label>
              <div className="flex items-center gap-2 bg-bg/50 rounded-xl border border-separator/30 px-4 py-1 focus-within:border-accent transition-colors">
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
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              邮箱
            </label>
            <div className="flex items-center gap-2 bg-bg/50 rounded-xl border border-separator/30 px-4 py-1 focus-within:border-accent transition-colors">
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
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              密码
            </label>
            <div className="flex items-center gap-2 bg-bg/50 rounded-xl border border-separator/30 px-4 py-1 focus-within:border-accent transition-colors">
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
                className="text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-accent-red font-medium text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-accent py-3.5 text-base font-semibold text-white transition-all btn-press disabled:opacity-50 shadow-sm shadow-accent/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
