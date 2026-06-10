-- ============================================================================
-- Reparo: image_path apontando pra arquivo inexistente no bucket dish-images
-- ============================================================================
-- Alguns pratos (cloned/reprocessados) ficaram com image_path apontando pra um
-- nome de arquivo que nunca foi criado (ex.: "...-goianiashopping-...-hq-XXXX.webp"),
-- enquanto o arquivo HQ real existe com outro sufixo e o mesmo UUID. No admin
-- (que lê ao vivo) a imagem some; no site às vezes segue o cache antigo.
--
-- Este script reaponta cada image_path quebrado pro melhor arquivo existente do
-- mesmo UUID (prefere -hq-.webp > -opt-.webp > .webp > maior nome). Idempotente:
-- só toca em paths que NÃO existem no storage. Roda nas duas unidades.
-- ============================================================================

with fix as (
  select d.id,
    (select o.name from storage.objects o
       where o.bucket_id = 'dish-images'
         and o.name like substring(d.image_path from 1 for 36) || '%'
       order by (o.name ~ '-hq-[^/]*\.webp$') desc,
                (o.name ~ '-opt-[^/]*\.webp$') desc,
                (o.name like '%.webp') desc,
                length(o.name) desc
       limit 1) as novo
  from public.dishes d
  where d.image_path is not null
    and not exists (
      select 1 from storage.objects o2
      where o2.bucket_id = 'dish-images' and o2.name = d.image_path
    )
)
update public.dishes d
set image_path = fix.novo, updated_at = now()
from fix
where fix.id = d.id and fix.novo is not null;
