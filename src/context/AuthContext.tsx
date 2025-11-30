
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

// Define user types
export type UserRole = "faculty" | "student" | "admin" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  erpId: string;
  department?: string;
  course?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  addUser: (userData: Omit<User, "id"> & { password: string }) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<User> & { password?: string }) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getUsers: (role: UserRole) => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default permissions by role
const DEFAULT_PERMISSIONS = {
  admin: ["all", "manage_users", "manage_tests", "manage_system"],
  faculty: ["create_test", "view_results", "manage_own_tests"],
  student: ["take_test", "view_own_results"]
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Defer fetching user profile to avoid deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Also check localStorage for offline/demo mode
    const storedUser = localStorage.getItem("pariksha_user");
    if (storedUser && !session) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (roleError && roleError.code !== "PGRST116") {
        console.error("Error fetching role:", roleError);
      }

      const userRole = roleData?.role as UserRole || "student";
      
      const userData: User = {
        id: userId,
        name: profile.full_name,
        email: profile.email,
        role: userRole,
        erpId: profile.email.split("@")[0], // Use email prefix as ERP ID
        permissions: DEFAULT_PERMISSIONS[userRole as keyof typeof DEFAULT_PERMISSIONS] || []
      };

      setUser(userData);
      localStorage.setItem("pariksha_user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const login = async (identifier: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Try Supabase auth first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier.includes("@") ? identifier : `${identifier}@pariksha.edu`,
        password,
      });

      if (error) {
        console.log("Supabase auth failed, trying local mock:", error.message);
        // Fall back to local mock for demo
        return loginLocal(identifier, password, role);
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      // Fall back to local mock
      return loginLocal(identifier, password, role);
    }
  };

  // Local mock login for demo purposes
  const loginLocal = async (identifier: string, password: string, role: UserRole): Promise<boolean> => {
    const MOCK_USERS = {
      faculty: [
        { id: "11111111-1111-1111-1111-111111111111", name: "Dr. Jane Smith", email: "jane@faculty.edu", erpId: "DBUUF001", password: "123456", role: "faculty" as UserRole, department: "Computer Science", permissions: [...DEFAULT_PERMISSIONS.faculty] },
        { id: "22222222-2222-2222-2222-222222222222", name: "Prof. John Doe", email: "john@faculty.edu", erpId: "DBUUF002", password: "password123", role: "faculty" as UserRole, department: "Mathematics", permissions: [...DEFAULT_PERMISSIONS.faculty] },
      ],
      student: [
        { id: "44444444-4444-4444-4444-444444444444", name: "Alex Johnson", email: "alex@student.edu", erpId: "22BTCSE0100", password: "password123", role: "student" as UserRole, course: "Computer Science", permissions: [...DEFAULT_PERMISSIONS.student] },
        { id: "66666666-6666-6666-6666-666666666666", name: "Anshul", email: "anshul@student.edu", erpId: "22BTCSE0200", password: "24042004", role: "student" as UserRole, course: "Computer Science", permissions: [...DEFAULT_PERMISSIONS.student] },
      ],
      admin: [
        { id: "77777777-7777-7777-7777-777777777777", name: "Admin User", email: "admin@pariksha.edu", erpId: "ADMIN001", password: "admin123", role: "admin" as UserRole, permissions: [...DEFAULT_PERMISSIONS.admin] },
      ]
    };

    const roleUsers = MOCK_USERS[role as keyof typeof MOCK_USERS] || [];
    const mockUser = roleUsers.find((u) => 
      (role === "admin" && u.email === identifier && u.password === password) ||
      (role !== "admin" && ((u.email === identifier || u.erpId === identifier) && u.password === password))
    );

    if (mockUser) {
      const { password: _, ...secureUser } = mockUser;
      setUser(secureUser as User);
      localStorage.setItem("pariksha_user", JSON.stringify(secureUser));
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem("pariksha_user");
  };

  const addUser = async (userData: Omit<User, "id"> & { password: string }): Promise<boolean> => {
    const { role, name, email, password, erpId } = userData;
    
    if (!role || !["faculty", "student", "admin"].includes(role)) {
      return false;
    }

    try {
      // Create auth user via Supabase Admin API (or sign up)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name,
          }
        }
      });

      if (authError) {
        console.error("Error creating auth user:", authError);
        // If user exists, we might need to just add the profile
        if (authError.message.includes("already registered")) {
          return false;
        }
        throw authError;
      }

      if (!authData.user) {
        console.error("No user returned from signup");
        return false;
      }

      const userId = authData.user.id;

      // Create profile (might be auto-created by trigger, so use upsert pattern)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: name,
          email: email,
        }, { onConflict: 'id' });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Continue anyway as trigger might have created it
      }

      // Add user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: role as "admin" | "faculty" | "student",
        });

      if (roleError) {
        console.error("Error adding role:", roleError);
        // If role already exists, that's ok
        if (!roleError.message.includes("duplicate")) {
          throw roleError;
        }
      }

      console.log("User created successfully:", userId);
      return true;
    } catch (error) {
      console.error("Error in addUser:", error);
      return false;
    }
  };

  const updateUser = async (id: string, userData: Partial<User> & { password?: string }): Promise<boolean> => {
    try {
      // Update profile
      if (userData.name || userData.email) {
        const updateData: any = {};
        if (userData.name) updateData.full_name = userData.name;
        if (userData.email) updateData.email = userData.email;

        const { error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", id);

        if (error) {
          console.error("Error updating profile:", error);
          throw error;
        }
      }

      // Update role if changed
      if (userData.role) {
        const { error } = await supabase
          .from("user_roles")
          .upsert({
            user_id: id,
            role: userData.role as "admin" | "faculty" | "student",
          }, { onConflict: 'user_id' });

        if (error) {
          console.error("Error updating role:", error);
        }
      }

      // Refresh current user if it's the same user
      if (user && user.id === id) {
        await fetchUserProfile(id);
      }

      return true;
    } catch (error) {
      console.error("Error in updateUser:", error);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      // Delete role first (due to foreign key)
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", id);

      // Delete profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting profile:", error);
        throw error;
      }

      // Note: Auth user deletion requires admin API or the user to delete themselves
      // This just removes the profile and role

      return true;
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return false;
    }
  };

  const getUsers = async (role: UserRole): Promise<User[]> => {
    if (!role || !["faculty", "student", "admin"].includes(role)) {
      return [];
    }

    try {
      // Get users with the specified role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", role);

      if (roleError) {
        console.error("Error fetching roles:", roleError);
        return [];
      }

      if (!roleData || roleData.length === 0) {
        return [];
      }

      const userIds = roleData.map(r => r.user_id);

      // Get profiles for these users
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profileError) {
        console.error("Error fetching profiles:", profileError);
        return [];
      }

      return profiles.map(p => ({
        id: p.id,
        name: p.full_name,
        email: p.email,
        role: role,
        erpId: p.email.split("@")[0],
        permissions: DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS] || []
      }));
    } catch (error) {
      console.error("Error in getUsers:", error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      addUser,
      updateUser,
      deleteUser,
      getUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
