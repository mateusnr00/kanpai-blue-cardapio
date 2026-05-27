-- ============================================================================
-- Linktree Theme: tema global aplicado em / e /l/[slug]
-- ----------------------------------------------------------------------------
-- Tabela com 1 linha (id='default'). O admin edita via /linktree/design
-- e o site público le e aplica nos estilos inline.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.linktree_theme (
  id text PRIMARY KEY DEFAULT 'default',

  -- Textos
  title text NOT NULL DEFAULT 'Kanpai Blue',
  subtitle text NOT NULL DEFAULT 'Culinária japonesa contemporânea, Goiânia',
  footer text NOT NULL DEFAULT '© Kanpai Blue',

  -- Logo (URL completa; null = usa LOGO_URL hardcoded do site)
  logo_url text,

  -- Background
  bg_kind text NOT NULL DEFAULT 'solid' CHECK (bg_kind IN ('solid','gradient','image')),
  bg_color text NOT NULL DEFAULT '#FAFAF8',
  bg_gradient_from text NOT NULL DEFAULT '#FAFAF8',
  bg_gradient_to text NOT NULL DEFAULT '#EDE7D4',
  bg_image_url text,

  -- Cores de texto
  text_color text NOT NULL DEFAULT '#1a1a1a',
  subtitle_color text NOT NULL DEFAULT '#666666',

  -- Botões
  button_style text NOT NULL DEFAULT 'outline' CHECK (button_style IN ('outline','filled')),
  button_border_color text NOT NULL DEFAULT '#1a1a1a',
  button_bg_color text NOT NULL DEFAULT '#1a1a1a',
  button_text_color text NOT NULL DEFAULT '#FFFFFF',
  button_radius integer NOT NULL DEFAULT 999,
  button_shadow boolean NOT NULL DEFAULT false,

  -- Tipografia
  font_family text NOT NULL DEFAULT 'Inter',

  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Garante exatamente 1 linha 'default'
INSERT INTO public.linktree_theme (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.linktree_theme ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon + authenticated) — o site público precisa ler
DROP POLICY IF EXISTS "linktree_theme read" ON public.linktree_theme;
CREATE POLICY "linktree_theme read"
  ON public.linktree_theme FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update só por autenticado (o admin já faz auth com Supabase Auth)
DROP POLICY IF EXISTS "linktree_theme update" ON public.linktree_theme;
CREATE POLICY "linktree_theme update"
  ON public.linktree_theme FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert também (o admin usa upsert; sem essa policy o upsert quebra
-- mesmo quando a linha 'default' já existe)
DROP POLICY IF EXISTS "linktree_theme insert" ON public.linktree_theme;
CREATE POLICY "linktree_theme insert"
  ON public.linktree_theme FOR INSERT
  TO authenticated
  WITH CHECK (true);
