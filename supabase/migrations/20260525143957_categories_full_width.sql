-- Card de categoria pode ocupar a fileira inteira na home (default off).
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS full_width boolean NOT NULL DEFAULT false;
