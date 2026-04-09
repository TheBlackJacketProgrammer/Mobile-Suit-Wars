-- Disable Row Level Security (RLS) on legacy game tables.
-- Without policies, RLS will silently filter out rows (causing "user not found").

ALTER TABLE public.event_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_suits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."user" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_has_mobile_suits DISABLE ROW LEVEL SECURITY;

