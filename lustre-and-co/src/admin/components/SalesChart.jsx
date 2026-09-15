import { useMemo } from "react";
import { salesData as fallbackData } from "../adminData";

export default function SalesChart({ data }) {
  const chartItems = useMemo(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      return data.map((item) => ({
        label: item.day || item.label || "Day",
        value: Number(item.amount || item.value || 0),
      }));
    }
    return fallbackData;
  }, [data]);

  const max = useMemo(() => {
    const rawMax = Math.max(...chartItems.map((item) => item.value), 1000);
    return rawMax > 0 ? rawMax : 1000;
  }, [chartItems]);

  const points = useMemo(() => {
    if (chartItems.length <= 1) return "0,50 100,50";
    return chartItems
      .map((item, index) => {
        const x = (index / (chartItems.length - 1)) * 100;
        const y = 100 - (item.value / max) * 82;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [chartItems, max]);

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="sales-chart">
      <div className="sales-chart-y-axis">
        <span>₹{(max / 1000).toFixed(0)}k</span>
        <span>₹{((max * 0.75) / 1000).toFixed(0)}k</span>
        <span>₹{((max * 0.5) / 1000).toFixed(0)}k</span>
        <span>₹{((max * 0.25) / 1000).toFixed(0)}k</span>
        <span>₹0</span>
      </div>

      <div className="sales-chart-stage">
        <div className="sales-chart-grid-lines">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="sales-chart-svg"
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#salesGradient)" />
          <polyline
            points={points}
            fill="none"
            stroke="#d4af37"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="sales-chart-labels">
          {chartItems.map((item, idx) => (
            <span key={`${item.label}-${idx}`}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}