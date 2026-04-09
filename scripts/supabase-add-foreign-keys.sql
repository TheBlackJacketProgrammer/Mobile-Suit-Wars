-- Add foreign keys so Prisma can infer relations for `include`.
-- Safe to run multiple times (duplicate_object exceptions are ignored).

DO $$
BEGIN
  -- user_has_mobile_suits.ms_id -> mobile_suits.ms_id
  BEGIN
    ALTER TABLE public.user_has_mobile_suits
      ADD CONSTRAINT user_has_mobile_suits_ms_id_fkey
      FOREIGN KEY (ms_id)
      REFERENCES public.mobile_suits (ms_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  -- user_has_mobile_suits.u_id -> "user".u_id
  BEGIN
    ALTER TABLE public.user_has_mobile_suits
      ADD CONSTRAINT user_has_mobile_suits_u_id_fkey
      FOREIGN KEY (u_id)
      REFERENCES public."user" (u_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END
$$;

