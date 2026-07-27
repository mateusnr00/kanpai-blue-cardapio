-- Subtítulo personalizável da página de sub-linktree (/l/{slug}).
-- Antes era fixo "Escolha a unidade"; agora cada sub-linktree pode ter o seu.
-- Vazio/null → o site usa o padrão "Escolha a unidade".

ALTER TABLE public.linktree_buttons
  ADD COLUMN IF NOT EXISTS child_subtitle text;
