"use client";

import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type ScriptableContext,
} from "chart.js";
import { getAdherenceTrend, type AdherenceRange } from "@/helpers/patientDetails";
import type { PatientRecord } from "@/lib/mocks/patients";
import PatientDetailSection from "./PatientDetailSection";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ranges: readonly { label: string; value: AdherenceRange }[] = [
  { label: "7 Hari", value: 7 },
  { label: "14 Hari", value: 14 },
  { label: "30 Hari", value: 30 },
];

const chartFontFamily = "Inter, system-ui, sans-serif";
ChartJS.defaults.font.family = chartFontFamily;

interface PatientAdherenceChartProps {
  readonly patient: PatientRecord;
}

export default function PatientAdherenceChart({ patient }: PatientAdherenceChartProps) {
  const [range, setRange] = useState<AdherenceRange>(7);
  const trend = useMemo(() => getAdherenceTrend(patient, range), [patient, range]);
  const data = useMemo<ChartData<"line">>(() => ({
    labels: trend.map((point) => point.label),
    datasets: [
      {
        label: "Kepatuhan",
        data: trend.map((point) => point.value),
        borderColor: "#147245",
        backgroundColor: (context: ScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(20,114,69,0.08)";
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(20,114,69,0.12)");
          gradient.addColorStop(1, "rgba(20,114,69,0)");
          return gradient;
        },
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#147245",
        pointBorderWidth: 3,
        pointHoverRadius: 6,
        pointRadius: range === 30 ? 2 : 4,
        borderWidth: 3,
        fill: true,
        tension: 0.42,
      },
    ],
  }), [range, trend]);

  const options = useMemo<ChartOptions<"line">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        displayColors: false,
        padding: 12,
        titleFont: { family: chartFontFamily, size: 13, weight: 700 },
        bodyFont: { family: chartFontFamily, size: 13, weight: 700 },
        callbacks: {
          label: (context) => `${context.parsed.y}% Kepatuhan`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { family: chartFontFamily, size: 12, weight: 600 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 },
        border: { display: false },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(15,23,42,0.08)" },
        ticks: { color: "#64748b", font: { family: chartFontFamily, size: 12, weight: 600 }, callback: (value) => `${value}%` },
        border: { display: false },
      },
    },
  }), []);

  return (
    <PatientDetailSection
      title="Tren Kepatuhan"
      action={(
        <div className="flex rounded-full bg-surface p-1">
          {ranges.map((currentRange) => {
            const isActive = currentRange.value === range;

            return (
              <button
                key={currentRange.value}
                type="button"
                onClick={() => setRange(currentRange.value)}
                className={`rounded-full px-3 py-2 text-xs font-extrabold transition-colors ${isActive ? "bg-primary text-white" : "text-muted hover:text-text-main"}`}
              >
                {currentRange.label}
              </button>
            );
          })}
        </div>
      )}
      className="min-h-[420px]"
      delay={0.18}
    >
      <div className="h-[300px] sm:h-[340px]">
        <Line data={data} options={options} />
      </div>
    </PatientDetailSection>
  );
}
