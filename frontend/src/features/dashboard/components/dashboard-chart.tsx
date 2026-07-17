"use client";

import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsBucket } from "@/types/dashboard";

const COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];

type DashboardChartProps = {
  data: AnalyticsBucket[];
  title: string;
  type: "bar" | "line" | "pie";
};

function DashboardChartComponent({ data, title, type }: DashboardChartProps) {
  const chartData = useMemo(
    () => (data.length > 0 ? data : [{ label: "No data", value: 0 }]),
    [data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base tracking-normal">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {type === "pie" ? (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                >
                  {chartData.map((item, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={item.label} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : type === "line" ? (
              <LineChart data={chartData} margin={{ bottom: 8, left: -20, right: 12, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} />
                <YAxis allowDecimals={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ bottom: 8, left: -20, right: 12, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} />
                <YAxis allowDecimals={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((item, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={item.label} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const DashboardChart = memo(DashboardChartComponent);
