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
  Area,
  AreaChart,
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
      <div className="glass-card px-4 py-2.5 shadow-xl !rounded-xl">
        <p className="text-sm font-semibold text-text-primary mb-1">
          {entry.display} {entry.weekday}
        </p>
        {payload.map((p: any, i: number) => (
          <p
            key={i}
            className="text-sm leading-relaxed"
            style={{ color: p.color }}
          >
            {p.name === "weight" ? "体重" : "7日均线"}
            <span className="font-bold ml-1">{p.value?.toFixed(1)} kg</span>
          </p>
        ))}
      </div>
    );
  };

  const minWeight = chartData.length > 0
    ? Math.min(...chartData.map((d) => d.weight))
    : 0;

  const gradientOffset = () => {
    const dataMax = Math.max(...chartData.map((d) => d.weight));
    const dataMin = Math.min(...chartData.map((d) => d.weight));
    if (dataMax <= dataMin) return 0;
    return (0 - dataMin) / (dataMax - dataMin);
  };

  return (
    <GlassCard className="pb-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">体重趋势</h2>
        <div className="flex gap-1 rounded-xl bg-fill p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                range === r
                  ? "bg-white text-text-primary shadow-sm dark:bg-card"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {r.replace("d", "天")}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-text-tertiary">
          <p className="text-sm font-medium">{range} 内暂无数据</p>
          <p className="text-xs mt-1">记录更多体重后趋势图将自动显示</p>
        </div>
      ) : (
        <>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -28 }}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" opacity={0.25} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontWeight: 500 }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <YAxis
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                  tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val.toFixed(1)}`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  fill="url(#weightGradient)"
                  stroke="none"
                />
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
                      <circle cx={cx} cy={cy} r={6} fill="var(--accent)" stroke="white" strokeWidth={2.5} />
                    ) : (
                      <circle cx={cx} cy={cy} r={3} fill="var(--accent)" opacity={0.5} />
                    );
                  }}
                  activeDot={{ r: 7, fill: "var(--accent)", stroke: "white", strokeWidth: 2.5 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="ma7"
                  name="ma7"
                  stroke="var(--accent-orange)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex items-center justify-center gap-5 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-4 rounded-sm bg-accent" />
              <span>体重</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0 w-4 border-t-2 border-dashed border-accent-orange" />
              <span>7日均线</span>
            </span>
            <span className="text-text-tertiary font-medium">
              {minWeight.toFixed(1)}–{Math.max(...chartData.map(d => d.weight)).toFixed(1)} kg
            </span>
          </div>
        </>
      )}
    </GlassCard>
  );
}
