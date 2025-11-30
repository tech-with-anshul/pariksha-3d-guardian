import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { UserRole, useAuth, User } from "@/context/AuthContext";
import { Layout, UserPlus, Users, FileText } from "lucide-react";
import UserTable from "@/components/admin/UserTable";
import UserForm, { UserFormData } from "@/components/admin/UserForm";
import StatsCard from "@/components/admin/StatsCard";
import AdminNavigation from "@/components/admin/AdminNavigation";

const AdminPanel = () => {
  const [activeMainTab, setActiveMainTab] = useState("users");
  const [activeUserTab, setActiveUserTab] = useState("faculty");
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [studentsList, setStudentsList] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState<string[]>([
    "Admin logged in at 09:23 AM",
    "New faculty member added at 10:15 AM",
    "Student record updated at 11:30 AM",
    "System backup completed at 12:00 PM",
  ]);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getUsers, addUser, updateUser, deleteUser } = useAuth();

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      if (user && (user.role === "admin" || (user.role === "faculty" && user.permissions?.includes("manage_users")))) {
        const facultyData = await getUsers("faculty");
        const studentsData = await getUsers("student");
        setFacultyList(facultyData);
        setStudentsList(studentsData);
      }
    };
    
    loadUsers();
  }, [user, getUsers]);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Check if user has permissions to access admin panel
    const hasAdminAccess = user.role === "admin" || 
      (user.role === "faculty" && user.permissions?.includes("manage_users"));
      
    if (!hasAdminAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      });
      navigate(user.role === "faculty" ? "/faculty-dashboard" : "/student-dashboard");
    }
  }, [user, navigate, toast]);

  if (!user) {
    return null;
  }

  const handleAddUser = async (userData: UserFormData) => {
    const role = activeUserTab === "faculty" ? "faculty" as UserRole : "student" as UserRole;
    
    if (!userData.name || !userData.email || !userData.password) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const newUserData = {
        name: userData.name,
        email: userData.email,
        role: role,
        erpId: userData.erpId,
        password: userData.password,
        permissions: userData.permissions,
        [role === "faculty" ? "department" : "course"]: role === "faculty" ? userData.department : userData.course,
      };
      
      const success = await addUser(newUserData);
      
      if (success) {
        // Refresh user lists
        const facultyData = await getUsers("faculty");
        const studentsData = await getUsers("student");
        setFacultyList(facultyData);
        setStudentsList(studentsData);
        
        toast({
          title: "Success",
          description: `New ${role} added successfully`,
        });
        
        addActivityLog(`Added ${role}: ${userData.name}`);
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to add user. Email or ERP ID may already exist.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleUpdateUser = async (userData: UserFormData) => {
    if (!editingUser) return;
    
    const role = editingUser.id.startsWith("f") ? "faculty" as UserRole : "student" as UserRole;
    
    // Only send password if it's provided (not empty)
    const updateData: Partial<User> & { password?: string } = {
      name: userData.name,
      email: userData.email,
      erpId: userData.erpId,
      permissions: userData.permissions,
      [role === "faculty" ? "department" : "course"]: 
        role === "faculty" ? userData.department : userData.course,
    };
    
    if (userData.password) {
      updateData.password = userData.password;
    }
    
    try {
      const success = await updateUser(editingUser.id, updateData);
      
      if (success) {
        // Refresh user lists
        const facultyData = await getUsers("faculty");
        const studentsData = await getUsers("student");
        setFacultyList(facultyData);
        setStudentsList(studentsData);
        
        toast({
          title: "Success",
          description: `${role === "faculty" ? "Faculty" : "Student"} updated successfully`,
        });
        
        addActivityLog(`Updated ${role}: ${userData.name}`);
        setEditingUser(null);
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string, role: UserRole) => {
    const userToDelete = role === "faculty" 
      ? facultyList.find(f => f.id === id)
      : studentsList.find(s => s.id === id);
    
    if (!userToDelete) return;
    
    try {
      const success = await deleteUser(id);
      
      if (success) {
        // Refresh user lists
        const facultyData = await getUsers("faculty");
        const studentsData = await getUsers("student");
        setFacultyList(facultyData);
        setStudentsList(studentsData);
        
        toast({
          title: "Success",
          description: `${role === "faculty" ? "Faculty" : "Student"} deleted successfully`,
        });
        
        addActivityLog(`Deleted ${role}: ${userToDelete.name}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the user",
        variant: "destructive",
      });
    }
  };

  const addActivityLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLogs((prev) => [`${message} at ${timestamp}`, ...prev.slice(0, 9)]);
  };

  const handleDialogClose = () => {
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const handleMainTabChange = (value: string) => {
    setActiveMainTab(value);
    addActivityLog(`Navigated to ${value} section`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Layout className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            <Button variant="outline" onClick={() => navigate(user.role === "admin" ? "/" : "/faculty-dashboard")}>
              Back to {user.role === "admin" ? "Home" : "Dashboard"}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard 
              title="Total Faculty" 
              value={facultyList.length} 
              icon={<Users className="h-8 w-8" />} 
            />
            <StatsCard 
              title="Total Students" 
              value={studentsList.length} 
              icon={<Users className="h-8 w-8" />} 
            />
            <StatsCard 
              title="Active Tests" 
              value="3" 
              icon={<FileText className="h-8 w-8" />} 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdminNavigation 
                activeMainTab={activeMainTab}
                onTabChange={handleMainTabChange}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Manage Users</CardTitle>
                    <CardDescription>
                      Add, edit, or remove faculty and students from the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs 
                      defaultValue={activeUserTab} 
                      onValueChange={setActiveUserTab}
                      className="w-full"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <TabsList>
                          <TabsTrigger value="faculty">Faculty</TabsTrigger>
                          <TabsTrigger value="students">Students</TabsTrigger>
                        </TabsList>
                        
                        <Button onClick={() => setIsDialogOpen(true)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add {activeUserTab === "faculty" ? "Faculty" : "Student"}
                        </Button>
                      </div>
                      
                      <TabsContent value="faculty">
                        <Card>
                          <CardContent className="p-0">
                            <UserTable 
                              users={facultyList}
                              role="faculty"
                              onEdit={handleEditUser}
                              onDelete={handleDeleteUser}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="students">
                        <Card>
                          <CardContent className="p-0">
                            <UserTable 
                              users={studentsList}
                              role="student"
                              onEdit={handleEditUser}
                              onDelete={handleDeleteUser}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </AdminNavigation>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>
                    Recent system activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLogs.map((log, index) => (
                      <div 
                        key={index} 
                        className="text-sm p-2 border-l-4 border-primary/30 pl-3 bg-muted/30"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingUser 
                    ? `Edit ${editingUser.id.startsWith('f') ? 'Faculty' : 'Student'}`
                    : `Add New ${activeUserTab === "faculty" ? "Faculty" : "Student"}`}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Update the details below to modify this user."
                    : "Fill in the details below to add a new user to the system."}
                </DialogDescription>
              </DialogHeader>
              
              <UserForm
                role={editingUser 
                  ? (editingUser.id.startsWith('f') ? "faculty" : "student") as UserRole 
                  : activeUserTab === "faculty" ? "faculty" : "student"}
                onSubmit={editingUser ? handleUpdateUser : handleAddUser}
                onCancel={handleDialogClose}
                editingUser={editingUser}
              />
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
