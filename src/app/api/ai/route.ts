import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `你是一位专业的减肥营养顾问和饮食健康专家。你的任务是：

1. 回答用户关于食物能否吃、热量高低、减肥期间是否适合的问题
2. 给出具体的营养分析和建议
3. 推荐更健康的替代食物选择
4. 结合减肥目标给出合理建议

回答规则：
- 用中文回答，简洁明了
- 每餐建议控制在 100-150 字以内
- 给出具体数据支持（如每100g的热量、蛋白质等）
- 语气积极鼓励，但保持专业
- 如果用户问的问题与饮食减肥无关，礼貌地引导回饮食话题
- 禁止推荐极端节食或危害健康的方案

用户可能正在使用 WeightTrack 体重管理应用，他们的目标是健康减重。`;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "请先登录" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!DEEPSEEK_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "DeepSeek API 密钥未配置。请在 .env 中设置 DEEPSEEK_API_KEY",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "请输入您的问题" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-10),
      { role: "user", content: message },
    ];

    const deepseekRes = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      }),
    });

    if (!deepseekRes.ok) {
      const errorText = await deepseekRes.text();
      console.error("DeepSeek API error:", deepseekRes.status, errorText);
      return new Response(
        JSON.stringify({ error: `AI 服务暂时不可用 (${deepseekRes.status})` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Transform the DeepSeek SSE stream to our own format
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = deepseekRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data:")) continue;

              const data = trimmed.slice(5).trim();

              // [DONE] signal
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // skip malformed JSON lines
              }
            }
          }
        } catch (err) {
          console.error("Stream read error:", err);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("AI advisor error:", error);
    return new Response(JSON.stringify({ error: "AI 服务请求失败，请稍后重试" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
