CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" varchar(100) NOT NULL,
	"actor_id" varchar(255),
	"actor_type" varchar(50),
	"subject_id" varchar(255),
	"subject_type" varchar(50),
	"occurred_at" timestamp with time zone NOT NULL,
	"metadata" jsonb
);
