
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  ChartContainer, 
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Session {
  id: string;
  student_id: string;
  erp_id: string;
  name: string;
  warnings: number;
  status: string;
  message: string;
}

interface TestSessionsChartProps {
  sessions: Session[];
}

const TestSessionsChart = ({ sessions }: TestSessionsChartProps) => {
  // Group students by warning category
  const categorizedData = [
    {
      name: "Continue",
      value: sessions.filter(s => s.status === "active" && s.warnings === 0).length,
      color: "#0ea5e9" // blue
    },
    {
      name: "Warnings > 1",
      value: sessions.filter(s => s.status === "active" && s.warnings > 0 && s.warnings < 3).length,
      color: "#10b981" // green
    },
    {
      name: "Warnings > 4",
      value: sessions.filter(s => s.status === "active" && s.warnings >= 3 && s.warnings < 5).length,
      color: "#f59e0b" // amber
    },
    {
      name: "Terminated",
      value: sessions.filter(s => s.status === "terminated" || s.warnings >= 5).length,
      color: "#ef4444" // red
    }
  ];

  // Filter out zero values
  const chartData = categorizedData.filter(item => item.value > 0);

  const chartConfig = {
    continue: { label: "Continue", theme: { dark: "#0ea5e9", light: "#0ea5e9" } },
    warnings1: { label: "Warnings > 1", theme: { dark: "#10b981", light: "#10b981" } },
    warnings4: { label: "Warnings > 4", theme: { dark: "#f59e0b", light: "#f59e0b" } },
    terminated: { label: "Terminated", theme: { dark: "#ef4444", light: "#ef4444" } },
  };

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend />
          <Tooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default TestSessionsChart;
