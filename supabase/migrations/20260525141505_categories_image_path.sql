-- Add optional image_path to categories.
-- Stored in the same dish-images bucket under a "categories/" prefix.
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_path text;
