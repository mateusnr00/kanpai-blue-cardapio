-- ============================================================================
-- Seções de detalhe do "Festival Premium" (título + descrição, em lista)
-- ============================================================================
-- Renderiza no cardápio (DishDetailsModal) abaixo da long_description, como
-- lista de blocos "TÍTULO + parágrafo". Usa a tabela dish_detail_sections
-- (mesma usada pelo SectionsEditor no admin → Pratos → prato → Detalhes).
--
-- Idempotente: remove as seções com esses títulos antes de reinserir, então
-- pode rodar de novo sem duplicar. Não toca em outras seções do prato.
--
-- COMO ACHAR O dish_id de outra unidade:
--   select d.id, d.restaurant_id, c.name as categoria
--   from dishes d left join categories c on c.id = d.category_id
--   where d.name ilike '%Festival Premium%';
--
-- Já aplicado em: goianiashopping → 'a718dc9a-8032-4ed3-b75c-a2b07c71b5e2'
-- (flamboyant 'edc24fef-...' já tinha as mesmas 4 seções.)
-- ============================================================================

\set dish_id '''a718dc9a-8032-4ed3-b75c-a2b07c71b5e2'''

begin;

delete from public.dish_detail_sections
where dish_id = :dish_id::uuid
  and label in ('Entradas Da Cozinha', 'Entradas Do Sushibar', 'Combinado Individual', 'Sobremesa');

insert into public.dish_detail_sections (dish_id, label, description, position) values
(:dish_id::uuid, 'Entradas Da Cozinha',  'Camarão empanado, guioza, isca de tilápia, pipoquinha de camarão, edamame e casquinha de siri gratinada no queijo parmesão.', 0),
(:dish_id::uuid, 'Entradas Do Sushibar', 'Variedade de pratos clássicos do Kanpai Blue (Shake hara (Salmão com crispy de batata doce) carpaccio salmão / saint peter, tataki, tartar do chef servido no gelo, dyo camarão flambado, sashimi maçaricado servido sob cama de shimeji entre outros servidos á vontade.', 1),
(:dish_id::uuid, 'Combinado Individual',  'Variação de sushis, sashimis, niguiris e Hot Roll filadelphia à vontade.', 2),
(:dish_id::uuid, 'Sobremesa',             'Tempurá de sorvete, Panqueca brulée com doce de leite argentino ou brigadeiro de colher.', 3);

commit;
