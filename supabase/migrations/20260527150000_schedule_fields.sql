-- Programacao de visibilidade: categorias e pratos podem ter janela de datas
-- + dias da semana off (0=domingo .. 6=sabado).
-- NULL nas datas = sem limite. Array vazio em off_days = ativo todos os dias.

ALTER TABLE public.categories
  ADD COLUMN schedule_start date,
  ADD COLUMN schedule_end date,
  ADD COLUMN schedule_off_days smallint[] NOT NULL DEFAULT '{}';

ALTER TABLE public.dishes
  ADD COLUMN schedule_start date,
  ADD COLUMN schedule_end date,
  ADD COLUMN schedule_off_days smallint[] NOT NULL DEFAULT '{}';

-- Indices parciais pra acelerar filtros do site (so cobre quem tem janela)
CREATE INDEX idx_categories_schedule
  ON public.categories (restaurant_id, schedule_start, schedule_end)
  WHERE schedule_start IS NOT NULL OR schedule_end IS NOT NULL;

CREATE INDEX idx_dishes_schedule
  ON public.dishes (restaurant_id, schedule_start, schedule_end)
  WHERE schedule_start IS NOT NULL OR schedule_end IS NOT NULL;
