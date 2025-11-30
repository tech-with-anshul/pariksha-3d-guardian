
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Mock database tables structure
interface TableStats {
  name: string;
  recordCount: number;
  lastUpdate: string;
  size: string;
}

const DatabaseStats = () => {
  const [tables] = useState<TableStats[]>([
    { 
      name: "users", 
      recordCount: 125, 
      lastUpdate: "2025-04-28 15:42:10",
      size: "1.2 MB"
    },
    { 
      name: "tests", 
      recordCount: 48, 
      lastUpdate: "2025-04-29 09:15:22",
      size: "3.5 MB"
    },
    { 
      name: "questions", 
      recordCount: 350, 
      lastUpdate: "2025-04-29 10:30:45",
      size: "4.7 MB"
    },
    { 
      name: "results", 
      recordCount: 210, 
      lastUpdate: "2025-04-29 11:05:18",
      size: "2.3 MB"
    }
  ]);

  // Calculate total storage
  const totalStorage = 20; // GB
  const usedStorage = 0.0117; // GB (sum of table sizes in MB converted to GB)
  const usedPercentage = (usedStorage / totalStorage) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Statistics</CardTitle>
        <CardDescription>Overview of database tables and storage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-sm text-muted-foreground">
                {usedStorage.toFixed(2)} GB of {totalStorage} GB
              </span>
            </div>
            <Progress value={usedPercentage} className="h-2" />
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-4 p-3 bg-muted/50 text-sm font-medium">
              <div>Table Name</div>
              <div>Records</div>
              <div>Last Update</div>
              <div>Size</div>
            </div>
            
            {tables.map((table) => (
              <div key={table.name} className="grid grid-cols-4 p-3 border-t text-sm">
                <div className="font-medium">{table.name}</div>
                <div>{table.recordCount}</div>
                <div>{table.lastUpdate}</div>
                <div>{table.size}</div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Database backups are performed daily at 00:00 UTC. Last backup: 2025-04-29 00:00:00 UTC
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseStats;
