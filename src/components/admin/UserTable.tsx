
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Shield } from "lucide-react";
import { UserRole, User } from "@/context/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserTableProps {
  users: User[];
  role: UserRole;
  onEdit: (user: User) => void;
  onDelete: (userId: string, role: UserRole) => void;
}

const UserTable = ({ users, role, onEdit, onDelete }: UserTableProps) => {
  // Function to get permission display name
  const getPermissionName = (permissionId: string): string => {
    const permissionMap: Record<string, string> = {
      all: "All Permissions",
      create_test: "Create Tests",
      view_results: "View Results",
      manage_own_tests: "Manage Tests",
      grade_tests: "Grade Tests",
      view_analytics: "View Analytics",
      take_test: "Take Tests",
      view_own_results: "View Results",
      submit_assignments: "Submit Assignments",
      manage_users: "Manage Users",
      manage_tests: "Manage Tests",
      manage_system: "Manage System"
    };
    return permissionMap[permissionId] || permissionId;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>{role === "faculty" ? "Department" : "Course"}</TableHead>
          <TableHead>ERP ID</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {role === "faculty" ? user.department : user.course}
              </TableCell>
              <TableCell>{user.erpId}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {user.permissions && user.permissions.includes('all') ? (
                    <Badge variant="outline" className="bg-primary/10">
                      All Permissions
                    </Badge>
                  ) : (
                    user.permissions && user.permissions.length > 0 ? (
                      <>
                        <Badge variant="outline" className="bg-primary/10">
                          {user.permissions.length}
                        </Badge>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5">
                                <Shield className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-[200px]">
                                {user.permissions.map((p) => (
                                  <div key={p} className="text-xs">
                                    {getPermissionName(p)}
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10">
                        None
                      </Badge>
                    )
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => onEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onDelete(user.id, role)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-6">
              No {role === "faculty" ? "faculty" : "students"} found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
