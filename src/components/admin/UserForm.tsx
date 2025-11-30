
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole, User } from "@/context/AuthContext";

interface UserFormProps {
  role: UserRole;
  onSubmit: (userData: UserFormData) => void;
  onCancel: () => void;
  editingUser?: User | null;
}

export interface UserFormData {
  name: string;
  email: string;
  erpId: string;
  password: string;
  department?: string;
  course?: string;
  role: UserRole;
  permissions?: string[];
}

// Define available permissions by role
const AVAILABLE_PERMISSIONS = {
  faculty: [
    { id: "create_test", label: "Create Tests" },
    { id: "view_results", label: "View Results" },
    { id: "manage_own_tests", label: "Manage Own Tests" },
    { id: "grade_tests", label: "Grade Tests" },
    { id: "view_analytics", label: "View Analytics" },
  ],
  student: [
    { id: "take_test", label: "Take Tests" },
    { id: "view_own_results", label: "View Own Results" },
    { id: "submit_assignments", label: "Submit Assignments" },
  ],
  admin: [
    { id: "all", label: "All Permissions" },
    { id: "manage_users", label: "Manage Users" },
    { id: "manage_tests", label: "Manage Tests" },
    { id: "manage_system", label: "Manage System" },
  ],
};

const UserForm = ({ role, onSubmit, onCancel, editingUser }: UserFormProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    erpId: "",
    password: "",
    department: "",
    course: "",
    role: role,
    permissions: [],
  });

  // Populate form when editing a user
  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || "",
        email: editingUser.email || "",
        erpId: editingUser.erpId || "",
        password: "", // Don't prefill password for security
        department: editingUser.department || "",
        course: editingUser.course || "",
        role: editingUser.role || role,
        permissions: editingUser.permissions || [],
      });
    }
  }, [editingUser, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (checked: boolean, permissionId: string) => {
    setFormData((prev) => {
      const currentPermissions = prev.permissions || [];
      
      if (checked) {
        // Special handling for "all" permission
        if (permissionId === "all") {
          // If "all" is checked, include all permissions for this role
          return {
            ...prev,
            permissions: AVAILABLE_PERMISSIONS[role].map(p => p.id)
          };
        }
        return {
          ...prev,
          permissions: [...currentPermissions, permissionId]
        };
      } else {
        // If "all" is unchecked, remove all permissions
        if (permissionId === "all") {
          return {
            ...prev,
            permissions: []
          };
        }
        // Remove the specific permission
        return {
          ...prev,
          permissions: currentPermissions.filter(id => id !== permissionId)
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Mock departments and courses for dropdown selection
  const departments = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology"];
  const courses = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Engineering"];

  const getErpIdPlaceholder = () => {
    return role === "faculty" ? "e.g. DBUUF001" : "e.g. 22BTCSE0200";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter full name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="erpId">{role === "faculty" ? "Faculty ID" : "Student ERP ID"}</Label>
        <Input
          id="erpId"
          name="erpId"
          placeholder={getErpIdPlaceholder()}
          value={formData.erpId}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
          value={formData.password}
          onChange={handleInputChange}
          required={!editingUser}
        />
      </div>
      
      {role === "faculty" ? (
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select 
            value={formData.department || ""}
            onValueChange={(value) => handleSelectChange(value, "department")}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
          <Select 
            value={formData.course || ""}
            onValueChange={(value) => handleSelectChange(value, "course")}
          >
            <SelectTrigger id="course">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label className="block mb-2">Permissions</Label>
        <div className="space-y-2 border rounded-md p-3">
          {AVAILABLE_PERMISSIONS[role].map((permission) => (
            <div key={permission.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`permission-${permission.id}`}
                checked={(formData.permissions || []).includes(permission.id)}
                onCheckedChange={(checked) => 
                  handlePermissionChange(checked as boolean, permission.id)
                }
              />
              <label 
                htmlFor={`permission-${permission.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {permission.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {editingUser ? "Update" : "Add"} {role === "faculty" ? "Faculty" : "Student"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
