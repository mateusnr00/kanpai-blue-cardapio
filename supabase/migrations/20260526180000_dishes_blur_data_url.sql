-- Blur preview inline pra placeholder instantaneo no site (LQIP - Low Quality Image Placeholder).
-- ~200-300 bytes de base64 WebP 16x16 por prato. Gerado no admin ao salvar a foto.

ALTER TABLE public.dishes
  ADD COLUMN blur_data_url text;

ALTER TABLE public.categories
  ADD COLUMN blur_data_url text;
