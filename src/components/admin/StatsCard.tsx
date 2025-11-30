
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  className?: string;
}

const StatsCard = ({ title, value, icon, className }: StatsCardProps) => {
  return (
    <Card className={`bg-primary/10 border-primary/20 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="text-primary mr-4">{icon}</div>
          <span className="text-3xl font-bold">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
