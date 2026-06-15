"use client";

import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const quickQuestions = [
  "晚上8点后能吃水果吗？",
  "减肥期间可以吃米饭吗？",
  "鸡胸肉和牛肉哪个更适合减肥？",
  "喝黑咖啡对减肥有帮助吗？",
  "一周吃几次火锅比较合适？",
  "减肥期间早餐推荐吃什么？",
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState("");
  const [showQuick, setShowQuick] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    setError("");
    setShowQuick(false);

    const userMsg: ChatMessage = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    setStreamingContent("");

    // Create an empty assistant message that will be streamed into
    const assistantIndex = messages.length + 1;

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-10),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `请求失败 (${res.status})`);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("无法读取响应");
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      // Streaming complete — add full message to history
      setMessages((prev) => [...prev, { role: "assistant", content: fullContent }]);
      setStreamingContent("");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("网络错误，请稍后重试");
    }

    setLoading(false);
    abortRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -mx-4 -mt-4">
      {/* Header */}
      <div className="bg-accent/5 px-4 py-3 flex items-center gap-3 shrink-0">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
          <Bot size={20} className="text-accent" />
        </span>
        <div className="flex-1">
          <h1 className="text-base font-bold text-text-primary">AI 饮食顾问</h1>
          <p className="text-[11px] text-text-secondary">由 DeepSeek 驱动 · 减肥饮食问答</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-green/10 text-[10px] font-medium text-accent-green">
          <Sparkles size={10} />
          智能
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-bg/30"
      >
        {/* Welcome */}
        {messages.length === 0 && !streamingContent && (
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 shrink-0 mt-0.5">
                <Bot size={14} className="text-accent" />
              </span>
              <GlassCard className="!rounded-2xl !rounded-tl-sm max-w-[85%]">
                <p className="text-sm text-text-primary leading-relaxed">
                  你好！我是你的 AI 饮食顾问 👋
                </p>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                  你可以问我任何关于食物、饮食、减肥的问题，比如某种食物能不能吃、热量高不高、有什么更好的替代选择。
                </p>
              </GlassCard>
            </div>

            {showQuick && (
              <div className="pl-9">
                <p className="text-[10px] text-text-tertiary mb-2 font-medium">
                  试试这些问题：
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-xs px-2.5 py-1.5 rounded-xl border border-separator/30 bg-card text-text-secondary hover:border-accent/30 hover:text-accent transition-all btn-press"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {msg.role === "assistant" && (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 shrink-0 mt-0.5">
                <Bot size={14} className="text-accent" />
              </span>
            )}
            <div
              className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-2xl rounded-tr-sm"
                  : "glass-card !rounded-2xl !rounded-tl-sm text-text-primary"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 shrink-0 mt-0.5">
              <Bot size={14} className="text-accent" />
            </span>
            <GlassCard className="!rounded-2xl !rounded-tl-sm">
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {streamingContent}
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-accent animate-pulse rounded-sm align-middle" />
              </p>
            </GlassCard>
          </div>
        )}

        {/* Loading dots before stream starts */}
        {loading && !streamingContent && (
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 shrink-0 mt-0.5">
              <Bot size={14} className="text-accent" />
            </span>
            <GlassCard className="!rounded-2xl !rounded-tl-sm">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Loader2 size={14} className="animate-spin" />
                思考中...
              </div>
            </GlassCard>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-accent-red py-2">
            <AlertCircle size={12} />
            {error}
          </div>
        )}

        {messages.length > 3 && !loading && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
              }}
              className="text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-separator/20 bg-card px-3 py-2.5 safe-bottom">
        <div className="flex items-center gap-2 bg-bg/60 rounded-2xl border border-separator/30 px-3 py-1 focus-within:border-accent/50 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的饮食问题..."
            className="flex-1 bg-transparent py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white btn-press disabled:opacity-40 disabled:active:scale-100 shrink-0"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-text-tertiary text-center mt-1.5">
          信息仅供参考，不构成医疗建议
        </p>
      </div>
    </div>
  );
}
