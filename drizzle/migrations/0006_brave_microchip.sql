CREATE TABLE IF NOT EXISTS "recado_curtidas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recado_id" uuid NOT NULL,
	"autor_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_curtida_recado_autor" UNIQUE("recado_id","autor_id")
);
--> statement-breakpoint
ALTER TABLE "recados" ADD COLUMN "fixado_em" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "recados" ADD COLUMN "lido_em" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recado_curtidas" ADD CONSTRAINT "recado_curtidas_recado_id_recados_id_fk" FOREIGN KEY ("recado_id") REFERENCES "public"."recados"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recado_curtidas" ADD CONSTRAINT "recado_curtidas_autor_id_perfis_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."perfis"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_curtidas_recado" ON "recado_curtidas" USING btree ("recado_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recados_fixados" ON "recados" USING btree ("fixado_em" desc nulls last);