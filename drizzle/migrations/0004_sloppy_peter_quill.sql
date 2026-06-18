CREATE TABLE IF NOT EXISTS "assistidos_juntos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filme_id" uuid NOT NULL,
	"data_assistido" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assistidos_juntos_filme_id_unique" UNIQUE("filme_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capsula_fotos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capsula_id" uuid NOT NULL,
	"drive_file_id" text NOT NULL,
	"mime_type" text NOT NULL,
	"tamanho_bytes" bigint NOT NULL,
	"legenda" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capsula_fotos_drive_file_id_unique" UNIQUE("drive_file_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capsulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"autor_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"conteudo" text NOT NULL,
	"data_criacao" timestamp with time zone DEFAULT now() NOT NULL,
	"data_desbloqueio" timestamp with time zone NOT NULL,
	"aberta_em" timestamp with time zone,
	CONSTRAINT "chk_desbloq_futuro" CHECK ("capsulas"."data_desbloqueio" > "capsulas"."data_criacao")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "config_casal" (
	"id" boolean PRIMARY KEY DEFAULT true NOT NULL,
	"data_inicio" timestamp with time zone NOT NULL,
	"carta_secreta" text,
	"spotify_playlist_id" text,
	CONSTRAINT "chk_config_singleton" CHECK ("config_casal"."id" = true)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"data_evento" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "filme_avaliacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filme_id" uuid NOT NULL,
	"autor_id" uuid NOT NULL,
	"nota" smallint NOT NULL,
	"texto" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_aval_filme_autor" UNIQUE("filme_id","autor_id"),
	CONSTRAINT "chk_nota" CHECK ("filme_avaliacoes"."nota" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "filme_favoritos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filme_id" uuid NOT NULL,
	"autor_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_fav_filme_autor" UNIQUE("filme_id","autor_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "filmes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tmdb_id" integer NOT NULL,
	"titulo" text NOT NULL,
	"poster_path" text,
	"ano" integer,
	"sinopse" text,
	"adicionado_por" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "filmes_tmdb_id_unique" UNIQUE("tmdb_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fotos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"autor_id" uuid,
	"drive_file_id" text NOT NULL,
	"mime_type" text NOT NULL,
	"tamanho_bytes" bigint NOT NULL,
	"legenda" text,
	"tirada_em" timestamp with time zone,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fotos_drive_file_id_unique" UNIQUE("drive_file_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "perfis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"senha_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "perfis_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"autor_id" uuid NOT NULL,
	"conteudo" text NOT NULL,
	"cor" text DEFAULT 'amarelo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assistidos_juntos" ADD CONSTRAINT "assistidos_juntos_filme_id_filmes_id_fk" FOREIGN KEY ("filme_id") REFERENCES "public"."filmes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capsula_fotos" ADD CONSTRAINT "capsula_fotos_capsula_id_capsulas_id_fk" FOREIGN KEY ("capsula_id") REFERENCES "public"."capsulas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capsulas" ADD CONSTRAINT "capsulas_autor_id_perfis_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."perfis"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filme_avaliacoes" ADD CONSTRAINT "filme_avaliacoes_filme_id_filmes_id_fk" FOREIGN KEY ("filme_id") REFERENCES "public"."filmes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filme_avaliacoes" ADD CONSTRAINT "filme_avaliacoes_autor_id_perfis_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."perfis"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filme_favoritos" ADD CONSTRAINT "filme_favoritos_filme_id_filmes_id_fk" FOREIGN KEY ("filme_id") REFERENCES "public"."filmes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filme_favoritos" ADD CONSTRAINT "filme_favoritos_autor_id_perfis_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."perfis"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filmes" ADD CONSTRAINT "filmes_adicionado_por_perfis_id_fk" FOREIGN KEY ("adicionado_por") REFERENCES "public"."perfis"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fotos" ADD CONSTRAINT "fotos_autor_id_perfis_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."perfis"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recados" ADD CONSTRAINT "recados_autor_id_perfis_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."perfis"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assistidos_data" ON "assistidos_juntos" USING btree ("data_assistido" desc nulls last);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_capsula_fotos_capsula" ON "capsula_fotos" USING btree ("capsula_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_capsula_fotos_created" ON "capsula_fotos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_capsulas_desbloq" ON "capsulas" USING btree ("data_desbloqueio");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_eventos_data" ON "eventos" USING btree ("data_evento" desc);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_filmes_created" ON "filmes" USING btree ("created_at" desc);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fotos_tirada_em" ON "fotos" USING btree ("tirada_em" desc nulls last);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recados_created" ON "recados" USING btree ("created_at" desc);