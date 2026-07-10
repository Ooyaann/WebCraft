CREATE TABLE "appreciation_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"siswa_id" text NOT NULL,
	"gallery_item_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creative_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"siswa_id" text NOT NULL,
	"name" text NOT NULL,
	"ast_json" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ct_journey_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"siswa_id" text NOT NULL,
	"task_id" text NOT NULL,
	"challenge_context" jsonb NOT NULL,
	"decomposition_answer_json" jsonb,
	"abstraction_answer_json" jsonb,
	"pattern_answer_json" jsonb,
	"algorithm_answer_json" jsonb,
	"ct_pre_score_json" jsonb,
	"is_locked" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ct_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"siswa_id" text NOT NULL,
	"pertemuan_id" text NOT NULL,
	"decomposition" integer NOT NULL,
	"pattern_recognition" integer NOT NULL,
	"abstraction" integer NOT NULL,
	"algorithm_design" integer NOT NULL,
	"composite_ct_score" integer NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" text PRIMARY KEY NOT NULL,
	"project_submission_id" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"appreciation_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "gallery_items_project_submission_id_unique" UNIQUE("project_submission_id")
);
--> statement-breakpoint
CREATE TABLE "learning_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"siswa_id" text NOT NULL,
	"ast_snapshots_json" jsonb NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"final_score" integer DEFAULT 0 NOT NULL,
	"accuracy_score" integer DEFAULT 0 NOT NULL,
	"efficiency_score" integer DEFAULT 0 NOT NULL,
	"ct_session_id" text,
	"reflection_answers_json" jsonb,
	"ct_post_score_json" jsonb,
	"ai_tutor_log_json" jsonb,
	"ai_feedback" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"pertemuan_id" text NOT NULL,
	"judul" text NOT NULL,
	"validator_rules_json" jsonb NOT NULL,
	"max_attempts_before_ai_hint" integer DEFAULT 4 NOT NULL,
	"ct_journey_json" jsonb
);
--> statement-breakpoint
CREATE TABLE "pertemuan" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"urutan" integer NOT NULL,
	"judul" text NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"cbl_engage_json" jsonb,
	"guiding_questions_json" jsonb,
	"reflection_questions_json" jsonb,
	"materi_list_json" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "project_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"siswa_id" text NOT NULL,
	"final_ast_json" jsonb NOT NULL,
	"ct_session_id" text,
	"ai_suggestion_json" jsonb,
	"teacher_score" integer,
	"teacher_comment" text,
	"rubrik_scores_json" jsonb,
	"is_published_to_gallery" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"graded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"pertemuan_id" text NOT NULL,
	"judul" text NOT NULL,
	"studi_kasus" text NOT NULL,
	"deadline" timestamp with time zone,
	"rubrik_json" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "room_members" (
	"room_id" text NOT NULL,
	"siswa_id" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_members_room_id_siswa_id_pk" PRIMARY KEY("room_id","siswa_id")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"guru_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"announcement" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'siswa' NOT NULL,
	"nisn_nip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appreciation_logs" ADD CONSTRAINT "appreciation_logs_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appreciation_logs" ADD CONSTRAINT "appreciation_logs_gallery_item_id_gallery_items_id_fk" FOREIGN KEY ("gallery_item_id") REFERENCES "public"."gallery_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_projects" ADD CONSTRAINT "creative_projects_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ct_journey_sessions" ADD CONSTRAINT "ct_journey_sessions_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ct_scores" ADD CONSTRAINT "ct_scores_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ct_scores" ADD CONSTRAINT "ct_scores_pertemuan_id_pertemuan_id_fk" FOREIGN KEY ("pertemuan_id") REFERENCES "public"."pertemuan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_project_submission_id_project_submissions_id_fk" FOREIGN KEY ("project_submission_id") REFERENCES "public"."project_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_submissions" ADD CONSTRAINT "learning_submissions_task_id_learning_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."learning_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_submissions" ADD CONSTRAINT "learning_submissions_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_submissions" ADD CONSTRAINT "learning_submissions_ct_session_id_ct_journey_sessions_id_fk" FOREIGN KEY ("ct_session_id") REFERENCES "public"."ct_journey_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_tasks" ADD CONSTRAINT "learning_tasks_pertemuan_id_pertemuan_id_fk" FOREIGN KEY ("pertemuan_id") REFERENCES "public"."pertemuan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pertemuan" ADD CONSTRAINT "pertemuan_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_task_id_project_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_ct_session_id_ct_journey_sessions_id_fk" FOREIGN KEY ("ct_session_id") REFERENCES "public"."ct_journey_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_pertemuan_id_pertemuan_id_fk" FOREIGN KEY ("pertemuan_id") REFERENCES "public"."pertemuan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" USING btree ("user_id");