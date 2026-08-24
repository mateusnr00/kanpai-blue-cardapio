-- Configurações globais do site (linha única). Guarda IDs de pixels/analytics
-- editáveis pelo admin em /configuracoes, disparados no site público.
-- Leitura pública (o site anônimo precisa pra renderizar os scripts),
-- escrita só autenticada (admin).

CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'default',
  meta_pixel_id text,
  ga4_id text,
  google_ads_id text,
  tiktok_pixel_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES ('default')
  ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "auth_write_site_settings" ON public.site_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
