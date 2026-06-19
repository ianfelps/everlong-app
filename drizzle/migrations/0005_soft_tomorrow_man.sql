CREATE TABLE IF NOT EXISTS "filme_watchlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filme_id" uuid NOT NULL,
	"adicionado_por" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "filme_watchlist_filme_id_unique" UNIQUE("filme_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filme_watchlist" ADD CONSTRAINT "filme_watchlist_filme_id_filmes_id_fk" FOREIGN KEY ("filme_id") REFERENCES "public"."filmes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filme_watchlist" ADD CONSTRAINT "filme_watchlist_adicionado_por_perfis_id_fk" FOREIGN KEY ("adicionado_por") REFERENCES "public"."perfis"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_watchlist_created" ON "filme_watchlist" USING btree ("created_at" desc);