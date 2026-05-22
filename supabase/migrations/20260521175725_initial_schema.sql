


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."decrement_dish_like"("p_dish_id" "text") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_count integer;
begin
  if length(p_dish_id) > 64 then
    raise exception 'dish_id too long';
  end if;

  update public.dish_likes
  set
    count = greatest(public.dish_likes.count - 1, 0),
    updated_at = now()
  where dish_id = p_dish_id
  returning count into v_count;

  return coalesce(v_count, 0);
end;
$$;


ALTER FUNCTION "public"."decrement_dish_like"("p_dish_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_dish_like"("p_dish_id" "text") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_count integer;
begin
  -- Limita o tamanho do dish_id pra evitar abuso
  if length(p_dish_id) > 64 then
    raise exception 'dish_id too long';
  end if;

  insert into public.dish_likes (dish_id, count, updated_at)
  values (p_dish_id, 1, now())
  on conflict (dish_id)
  do update set
    count = public.dish_likes.count + 1,
    updated_at = now()
  returning count into v_count;

  return v_count;
end;
$$;


ALTER FUNCTION "public"."increment_dish_like"("p_dish_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."dish_likes" (
    "dish_id" "text" NOT NULL,
    "count" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."dish_likes" OWNER TO "postgres";


COMMENT ON TABLE "public"."dish_likes" IS 'Contador de curtidas por prato do cardápio Kanpai Blue';



COMMENT ON COLUMN "public"."dish_likes"."dish_id" IS 'Slug do prato, casa com Dish.id em lib/menu-data.ts';



ALTER TABLE ONLY "public"."dish_likes"
    ADD CONSTRAINT "dish_likes_pkey" PRIMARY KEY ("dish_id");



CREATE INDEX "dish_likes_count_idx" ON "public"."dish_likes" USING "btree" ("count" DESC);



ALTER TABLE "public"."dish_likes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dish_likes_read_public" ON "public"."dish_likes" FOR SELECT TO "authenticated", "anon" USING (true);



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_dish_like"("p_dish_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_dish_like"("p_dish_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_dish_like"("p_dish_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_dish_like"("p_dish_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_dish_like"("p_dish_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_dish_like"("p_dish_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON TABLE "public"."dish_likes" TO "anon";
GRANT ALL ON TABLE "public"."dish_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."dish_likes" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







