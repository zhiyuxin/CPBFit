import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(date: Date | string): string {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (formatDate(d) === formatDate(today)) return "今天";
  if (formatDate(d) === formatDate(yesterday)) return "昨天";

  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

export function getWeekday(date: Date | string): string {
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return days[new Date(date).getDay()];
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "偏瘦", color: "#3B82F6" };
  if (bmi < 24) return { label: "正常", color: "#22C55E" };
  if (bmi < 28) return { label: "偏胖", color: "#F59E0B" };
  return { label: "肥胖", color: "#EF4444" };
}

export function getDateRange(days: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
}

export function movingAverage(
  data: { date: string; weight: number }[],
  window: number
): { date: string; weight: number }[] {
  return data.map((point, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = data.slice(start, index + 1);
    const avg =
      slice.reduce((sum, p) => sum + p.weight, 0) / slice.length;
    return { date: point.date, weight: Math.round(avg * 100) / 100 };
  });
}
