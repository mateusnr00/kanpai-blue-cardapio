-- Rótulos customizados por menu para os grupos de componentes.
-- Por padrão os grupos aparecem como "Entradas/Principais/Sobremesas"; este
-- campo permite renomeá-los por prato-pai (ex.: "Couvert", "Pratos do chef").
-- jsonb keyed por kind: { "entrada": "...", "principal": "...", "sobremesa": "..." }.
-- Ausência da chave (ou string vazia) → usa o rótulo padrão.
ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS component_labels jsonb NOT NULL DEFAULT '{}'::jsonb;
