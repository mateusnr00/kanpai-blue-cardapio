-- ============================================================================
-- Storage bucket: dish-images
-- Bucket publico de leitura, escrita restrita a usuarios autenticados.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura publica
CREATE POLICY "dish_images_select_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'dish-images');

-- Escrita / update / delete: so autenticado
CREATE POLICY "dish_images_insert_auth"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dish-images');

CREATE POLICY "dish_images_update_auth"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'dish-images')
  WITH CHECK (bucket_id = 'dish-images');

CREATE POLICY "dish_images_delete_auth"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'dish-images');
