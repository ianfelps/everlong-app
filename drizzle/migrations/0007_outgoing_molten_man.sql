ALTER TABLE "config_casal" ADD COLUMN "total_fotos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "config_casal" ADD COLUMN "total_eventos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "config_casal" ADD COLUMN "total_capsulas_abertas" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "config_casal" ADD COLUMN "total_filmes_assistidos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "config_casal" ADD COLUMN "total_recados" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "config_casal"
SET
  "total_fotos" = (SELECT count(*)::integer FROM "fotos"),
  "total_eventos" = (SELECT count(*)::integer FROM "eventos"),
  "total_capsulas_abertas" = (SELECT count(*)::integer FROM "capsulas" WHERE "aberta_em" IS NOT NULL),
  "total_filmes_assistidos" = (SELECT count(*)::integer FROM "assistidos_juntos"),
  "total_recados" = (SELECT count(*)::integer FROM "recados");--> statement-breakpoint
CREATE OR REPLACE FUNCTION atualizar_resumo_memorias()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  coluna text;
  delta integer := 0;
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'fotos' THEN coluna := 'total_fotos';
    WHEN 'eventos' THEN coluna := 'total_eventos';
    WHEN 'assistidos_juntos' THEN coluna := 'total_filmes_assistidos';
    WHEN 'recados' THEN coluna := 'total_recados';
    WHEN 'capsulas' THEN
      coluna := 'total_capsulas_abertas';
      IF TG_OP = 'INSERT' THEN
        delta := CASE WHEN NEW.aberta_em IS NULL THEN 0 ELSE 1 END;
      ELSIF TG_OP = 'DELETE' THEN
        delta := CASE WHEN OLD.aberta_em IS NULL THEN 0 ELSE -1 END;
      ELSE
        delta := (CASE WHEN NEW.aberta_em IS NULL THEN 0 ELSE 1 END)
          - (CASE WHEN OLD.aberta_em IS NULL THEN 0 ELSE 1 END);
      END IF;
  END CASE;

  IF TG_TABLE_NAME <> 'capsulas' THEN
    delta := CASE TG_OP WHEN 'INSERT' THEN 1 ELSE -1 END;
  END IF;

  IF delta <> 0 THEN
    EXECUTE format(
      'UPDATE config_casal SET %I = GREATEST(0, %I + $1) WHERE id = true',
      coluna,
      coluna
    ) USING delta;
  END IF;

  RETURN NULL;
END;
$$;--> statement-breakpoint
CREATE TRIGGER atualizar_total_fotos
AFTER INSERT OR DELETE ON "fotos"
FOR EACH ROW EXECUTE FUNCTION atualizar_resumo_memorias();--> statement-breakpoint
CREATE TRIGGER atualizar_total_eventos
AFTER INSERT OR DELETE ON "eventos"
FOR EACH ROW EXECUTE FUNCTION atualizar_resumo_memorias();--> statement-breakpoint
CREATE TRIGGER atualizar_total_capsulas_abertas
AFTER INSERT OR UPDATE OF "aberta_em" OR DELETE ON "capsulas"
FOR EACH ROW EXECUTE FUNCTION atualizar_resumo_memorias();--> statement-breakpoint
CREATE TRIGGER atualizar_total_filmes_assistidos
AFTER INSERT OR DELETE ON "assistidos_juntos"
FOR EACH ROW EXECUTE FUNCTION atualizar_resumo_memorias();--> statement-breakpoint
CREATE TRIGGER atualizar_total_recados
AFTER INSERT OR DELETE ON "recados"
FOR EACH ROW EXECUTE FUNCTION atualizar_resumo_memorias();
