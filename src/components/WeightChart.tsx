"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { GlassCard } from "./GlassCard";
import { formatDate, formatDateDisplay, getWeekday, movingAverage } from "@/lib/utils";

interface WeightChartProps {
  data: { id: string; date: string; weightKg: number }[];
}

type TimeRange = "7d" | "14d" | "30d" | "90d";

const rangeMap: Record<TimeRange, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
};

export function WeightChart({ data }: WeightChartProps) {
  const [range, setRange] = useState<TimeRange>("30d");

  const filtered = useMemo(() => {
    const days = rangeMap[range];
    const since = new Date();
    since.setDate(since.getDate() - days);
    return data.filter((d) => new Date(d.date) >= since);
  }, [data, range]);

  const chartData = useMemo(() => {
    const points = filtered.map((d) => ({
      date: formatDate(d.date),
      weight: d.weightKg,
      display: formatDateDisplay(d.date),
      weekday: getWeekday(d.date),
    }));
    const ma7 = movingAverage(
      points.map((p) => ({ date: p.date, weight: p.weight })),
      7
    );
    return points.map((p, i) => ({
      ...p,
      ma7: ma7[i]?.weight ?? null,
    }));
  }, [filtered]);

  const ranges: TimeRange[] = ["7d", "14d", "30d", "90d"];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const entry = chartData.find((d) => d.date === label);
    if (!entry) return null;
    return (
      <div className="glass-card px-3 py-2 shadow-lg !rounded-xl">
        <p className="text-sm font-semibold text-text-primary">
          {entry.display} {entry.weekday}
        </p>
        {payload.map((p: any, i: number) => (
          <p
            key={i}
            className="text-sm"
            style={{ color: p.color }}
          >
            {p.name === "weight" ? "体重" : "7日均线"}: {p.value?.toFixed(1)} kg
          </p>
        ))}
      </div>
    );
  };

  return (
    <GlassCard className="pb-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">体重趋势</h2>
        <div className="flex gap-1 rounded-lg bg-fill p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r
                  ? "bg-white text-text-primary shadow-sm dark:bg-card"
                  : "text-text-secondary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="weight"
              name="weight"
              stroke="var(--accent)"
              strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, index } = props;
                const isLatest = index === chartData.length - 1;
                return isLatest ? (
                  <circle cx={cx} cy={cy} r={5} fill="var(--accent)" stroke="white" strokeWidth={2} />
                ) : (
                  <circle cx={cx} cy={cy} r={2.5} fill="var(--accent)" opacity={0.6} />
                );
              }}
              activeDot={{ r: 6, fill: "var(--accent)", stroke: "white", strokeWidth: 2 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="ma7"
              name="ma7"
              stroke="var(--accent-orange)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded-sm bg-accent" /> 体重
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-accent-orange" /> 7日均线
        </span>
      </div>
    </GlassCard>
  );
}
