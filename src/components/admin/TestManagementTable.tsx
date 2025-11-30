
import { useAuth } from "@/context/AuthContext";
import { useTest, type Test } from "@/context/TestContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  erpId: string;
  role: string;
}

const TestManagementTable = () => {
  const { tests, deleteTest, isLoading: testsLoading } = useTest();
  const { getUsers } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  useEffect(() => {
    const fetchAllProfiles = async () => {
      try {
        const [faculty, students, admins] = await Promise.all([
          getUsers("faculty"),
          getUsers("student"), 
          getUsers("admin")
        ]);
        const allProfiles = [...faculty, ...students, ...admins].map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          erpId: user.erpId,
          role: user.role || 'unknown'
        }));
        setProfiles(allProfiles);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setProfilesLoading(false);
      }
    };

    fetchAllProfiles();
  }, [getUsers]);

  const getCreatorName = (userId: string) => {
    if (!profiles) return "Unknown";
    const profile = profiles.find((p) => p.id === userId);
    return profile ? profile.name : "Unknown User";
  };

  const handleDelete = async (testId: string) => {
    try {
      await deleteTest(testId);
      toast({
        title: "Test Deleted",
        description: "The test has been successfully deleted.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete test: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  if (profilesLoading || testsLoading) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Test Management</CardTitle>
          <CardDescription>
            Manage all tests in the system. Review, edit, or delete existing tests.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </CardContent>
       </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Management</CardTitle>
        <CardDescription>
          Manage all tests in the system. Review, edit, or delete existing tests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-center">Questions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.length === 0 ? (
               <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No tests found.
                </TableCell>
              </TableRow>
            ) : tests.map((test: Test) => (
              <TableRow key={test.id}>
                <TableCell className="font-medium">{test.title}</TableCell>
                <TableCell>{test.subject}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs capitalize ${
                      test.status === "published"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {test.status}
                  </span>
                </TableCell>
                <TableCell>{getCreatorName(test.createdBy)}</TableCell>
                <TableCell className="text-center">{test.questions.length}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/test-dashboard/${test.id}`)}
                    title="View Dashboard"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Delete Test">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the test and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(test.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TestManagementTable;
