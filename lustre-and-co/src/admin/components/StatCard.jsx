import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function StatCard({
  label,
  value,
  change,
  trend = "up",
  icon: Icon,
  tone = "gold"
}) {
  return (
    <article className={`admin-stat-card admin-stat-${tone}`}>
      <div className="admin-stat-top">
        <span>{label}</span>
        <div className="admin-stat-icon">
          <Icon size={18} />
        </div>
      </div>

      <strong>{value}</strong>

      <div className={`admin-stat-change ${trend}`}>
        {trend === "up" ? (
          <ArrowUpRight size={14} />
        ) : (
          <ArrowDownRight size={14} />
        )}
        <span>{change}</span>
        <small>vs last month</small>
      </div>
    </article>
  );
}