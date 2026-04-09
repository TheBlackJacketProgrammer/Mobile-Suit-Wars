-- Add uniqueness needed for Prisma `findUnique()` in auth flow.
-- Safe to run multiple times (duplicate_object exceptions are ignored).

DO $$
BEGIN
  -- user.u_account unique
  BEGIN
    ALTER TABLE public."user"
      ADD CONSTRAINT user_u_account_key UNIQUE (u_account);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  -- user.u_email unique
  BEGIN
    ALTER TABLE public."user"
      ADD CONSTRAINT user_u_email_key UNIQUE (u_email);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END
$$;

