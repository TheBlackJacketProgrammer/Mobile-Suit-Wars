-- Add primary keys required by Prisma Client.
-- Run this in Supabase SQL Editor (or via psql) against the same database.

DO $$
BEGIN
  -- event_logs(log_id)
  BEGIN
    ALTER TABLE public.event_logs
      ALTER COLUMN log_id SET NOT NULL;
    ALTER TABLE public.event_logs
      ADD CONSTRAINT event_logs_pkey PRIMARY KEY (log_id);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  -- mobile_suits(ms_id)
  BEGIN
    ALTER TABLE public.mobile_suits
      ALTER COLUMN ms_id SET NOT NULL;
    ALTER TABLE public.mobile_suits
      ADD CONSTRAINT mobile_suits_pkey PRIMARY KEY (ms_id);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  -- "user"(u_id)  (quoted because USER is a keyword)
  BEGIN
    ALTER TABLE public."user"
      ALTER COLUMN u_id SET NOT NULL;
    ALTER TABLE public."user"
      ADD CONSTRAINT user_pkey PRIMARY KEY (u_id);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  -- user_has_mobile_suits(u_id, ms_id)
  BEGIN
    ALTER TABLE public.user_has_mobile_suits
      ALTER COLUMN u_id SET NOT NULL;
    ALTER TABLE public.user_has_mobile_suits
      ALTER COLUMN ms_id SET NOT NULL;
    ALTER TABLE public.user_has_mobile_suits
      ADD CONSTRAINT user_has_mobile_suits_pkey PRIMARY KEY (u_id, ms_id);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END
$$;

