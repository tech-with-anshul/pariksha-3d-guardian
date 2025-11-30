
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Database, FileText, Settings } from "lucide-react";
import DatabaseStats from "./DatabaseStats";
import TestManagementTable from "./TestManagementTable";
import SystemSettings from "./SystemSettings";

interface AdminNavigationProps {
  activeMainTab: string;
  children: React.ReactNode;
  onTabChange: (value: string) => void;
}

const AdminNavigation = ({ activeMainTab, children, onTabChange }: AdminNavigationProps) => {
  return (
    <Tabs value={activeMainTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 w-full mb-6">
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Users</span>
        </TabsTrigger>
        <TabsTrigger value="database" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span className="hidden sm:inline">Database</span>
        </TabsTrigger>
        <TabsTrigger value="tests" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Tests</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="users">
        {children}
      </TabsContent>
      
      <TabsContent value="database">
        <DatabaseStats />
      </TabsContent>
      
      <TabsContent value="tests">
        <TestManagementTable />
      </TabsContent>
      
      <TabsContent value="settings">
        <SystemSettings />
      </TabsContent>
    </Tabs>
  );
};

export default AdminNavigation;
