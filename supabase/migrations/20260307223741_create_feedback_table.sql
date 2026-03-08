-- Create feedback table for landing page contact form
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text,
  message text NOT NULL,
  newsletter_opt_in boolean DEFAULT false,
  opt_in_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon + authenticated) to submit feedback
CREATE POLICY "public_feedback_insert"
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
