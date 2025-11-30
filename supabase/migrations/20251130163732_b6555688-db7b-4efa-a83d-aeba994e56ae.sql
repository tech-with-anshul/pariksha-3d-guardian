-- Allow admins to insert profiles (for creating faculty/students)
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for test_sessions to track live submissions
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_sessions;

-- Enable realtime for answers to track live answer submissions
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;

-- Enable realtime for test_results
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_results;