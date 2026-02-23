CREATE TABLE "activity_log" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(64) NOT NULL,
	"member_id" varchar(64) NOT NULL,
	"member_name" varchar(255) NOT NULL,
	"action" varchar(255) NOT NULL,
	"target" varchar(500) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(64) NOT NULL,
	"title" varchar(500) NOT NULL,
	"due_date" timestamp NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"type" varchar(32) DEFAULT 'general' NOT NULL,
	"color" varchar(16) DEFAULT '#6366f1' NOT NULL,
	"icon" varchar(64) DEFAULT 'Folder' NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_dependencies" (
	"task_id" varchar(64) NOT NULL,
	"depends_on_id" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(64) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" varchar(32) DEFAULT 'backlog' NOT NULL,
	"priority" varchar(16) DEFAULT 'medium' NOT NULL,
	"assignee" varchar(255),
	"due_date" timestamp,
	"start_date" timestamp,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"subtasks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"approval_required" boolean DEFAULT false NOT NULL,
	"approver" varchar(255),
	"approval_status" varchar(16) DEFAULT 'none' NOT NULL,
	"approval_comment" text,
	"approval_requested_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(32) DEFAULT 'viewer' NOT NULL,
	"avatar" varchar(500),
	"invited_by" varchar(64),
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(32) DEFAULT 'invited' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_channels" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_by" varchar(64) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"channel_id" varchar(64) NOT NULL,
	"project_id" varchar(64) NOT NULL,
	"sender_id" varchar(64) NOT NULL,
	"sender_name" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"thread_id" varchar(64),
	"mentions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"edited" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(64),
	"task_id" varchar(64),
	"title" varchar(500) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"start" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"color" varchar(16) DEFAULT '#6366f1' NOT NULL,
	"type" varchar(32) DEFAULT 'event' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_items" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(64) NOT NULL,
	"name" varchar(500) NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"type" varchar(128) DEFAULT '' NOT NULL,
	"url" text DEFAULT '' NOT NULL,
	"folder" varchar(255) DEFAULT '' NOT NULL,
	"uploaded_by" varchar(255) NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" varchar(64) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"screen" boolean DEFAULT true NOT NULL,
	"email" boolean DEFAULT true NOT NULL,
	"sms" boolean DEFAULT false NOT NULL,
	"email_address" varchar(255) DEFAULT '' NOT NULL,
	"phone_number" varchar(32) DEFAULT '' NOT NULL,
	"task_assigned" jsonb DEFAULT '["screen","email"]'::jsonb NOT NULL,
	"task_completed" jsonb DEFAULT '["screen"]'::jsonb NOT NULL,
	"task_overdue" jsonb DEFAULT '["screen","email","sms"]'::jsonb NOT NULL,
	"event_reminder" jsonb DEFAULT '["screen","email"]'::jsonb NOT NULL,
	"file_uploaded" jsonb DEFAULT '["screen"]'::jsonb NOT NULL,
	"project_update" jsonb DEFAULT '["screen"]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(16) DEFAULT 'info' NOT NULL,
	"channel" jsonb DEFAULT '["screen"]'::jsonb NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"action_url" varchar(500),
	"project_id" varchar(64),
	"task_id" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_budget_items" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"category" varchar(32) DEFAULT 'miscellaneous' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"vendor" varchar(255) DEFAULT '' NOT NULL,
	"estimated_amount" integer DEFAULT 0 NOT NULL,
	"actual_amount" integer,
	"status" varchar(32) DEFAULT 'estimated' NOT NULL,
	"approved_by" varchar(255),
	"approved_at" timestamp,
	"receipt_url" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_checklists" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"category" varchar(32) DEFAULT 'setup' NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_by" varchar(255),
	"completed_at" timestamp,
	"due_date" timestamp,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_documents" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"type" varchar(32) DEFAULT 'other' NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"file_name" varchar(500) DEFAULT '' NOT NULL,
	"file_url" text DEFAULT '' NOT NULL,
	"file_size" integer DEFAULT 0 NOT NULL,
	"scoped_to_stakeholder_id" varchar(64),
	"visible_to_stakeholder_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sign_status" varchar(32) DEFAULT 'draft' NOT NULL,
	"signed_by" varchar(255),
	"signed_at" timestamp,
	"signature_data" text,
	"signer_name" varchar(255),
	"signer_email" varchar(255),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_issues" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"reported_by" varchar(255) NOT NULL,
	"reported_by_personnel_id" varchar(64),
	"category" varchar(32) DEFAULT 'other' NOT NULL,
	"severity" varchar(16) DEFAULT 'medium' NOT NULL,
	"status" varchar(32) DEFAULT 'open' NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"resolution" text DEFAULT '' NOT NULL,
	"resolved_by" varchar(255),
	"resolved_at" timestamp,
	"escalated_to" varchar(255),
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_leads" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"captured_by" varchar(255) NOT NULL,
	"first_name" varchar(255) DEFAULT '' NOT NULL,
	"last_name" varchar(255) DEFAULT '' NOT NULL,
	"email" varchar(255) DEFAULT '' NOT NULL,
	"phone" varchar(32) DEFAULT '' NOT NULL,
	"instagram_handle" varchar(255) DEFAULT '' NOT NULL,
	"x_handle" varchar(255) DEFAULT '' NOT NULL,
	"source" varchar(32) DEFAULT 'walk_in' NOT NULL,
	"consent_given" boolean DEFAULT false NOT NULL,
	"consent_timestamp" timestamp,
	"consent_text" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_media" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"type" varchar(16) DEFAULT 'photo' NOT NULL,
	"url" text DEFAULT '' NOT NULL,
	"thumbnail_url" text DEFAULT '' NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"taken_by" varchar(255) DEFAULT '' NOT NULL,
	"taken_at" timestamp DEFAULT now() NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"approved_by" varchar(255),
	"file_size" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_personnel" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"stakeholder_id" varchar(64),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) DEFAULT '' NOT NULL,
	"phone" varchar(32) DEFAULT '' NOT NULL,
	"role" varchar(255) DEFAULT '' NOT NULL,
	"clock_status" varchar(32) DEFAULT 'not_started' NOT NULL,
	"clock_in_time" timestamp,
	"clock_out_time" timestamp,
	"break_start_time" timestamp,
	"total_hours_worked" integer,
	"hourly_rate" integer DEFAULT 0 NOT NULL,
	"product_knowledge_verified" boolean DEFAULT false NOT NULL,
	"product_knowledge_verified_at" timestamp,
	"product_knowledge_score" integer,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_products" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"name" varchar(500) NOT NULL,
	"sku" varchar(128) DEFAULT '' NOT NULL,
	"category" varchar(64) DEFAULT '' NOT NULL,
	"quantity_requested" integer DEFAULT 0 NOT NULL,
	"quantity_confirmed" integer DEFAULT 0 NOT NULL,
	"quantity_shipped" integer DEFAULT 0 NOT NULL,
	"quantity_delivered" integer DEFAULT 0 NOT NULL,
	"quantity_used" integer DEFAULT 0 NOT NULL,
	"quantity_returned" integer DEFAULT 0 NOT NULL,
	"quantity_damaged" integer DEFAULT 0 NOT NULL,
	"unit_cost" integer DEFAULT 0 NOT NULL,
	"status" varchar(32) DEFAULT 'requested' NOT NULL,
	"shipping_tracking_number" varchar(255) DEFAULT '' NOT NULL,
	"shipping_carrier" varchar(128) DEFAULT '' NOT NULL,
	"expected_delivery_date" timestamp,
	"delivered_at" timestamp,
	"reconciled_at" timestamp,
	"reconciled_by" varchar(255),
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_reports" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"title" varchar(500) NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"total_leads" integer DEFAULT 0 NOT NULL,
	"total_samples" integer DEFAULT 0 NOT NULL,
	"total_interactions" integer DEFAULT 0 NOT NULL,
	"total_budget_spent" integer DEFAULT 0 NOT NULL,
	"cost_per_lead" integer DEFAULT 0 NOT NULL,
	"cost_per_sample" integer DEFAULT 0 NOT NULL,
	"cost_per_interaction" integer DEFAULT 0 NOT NULL,
	"highlights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"challenges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommendations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"generated_by" varchar(255) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_run_of_show" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"time" varchar(16) NOT NULL,
	"end_time" varchar(16),
	"title" varchar(500) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"responsible_personnel_id" varchar(64),
	"responsible_name" varchar(255) DEFAULT '' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_stakeholders" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) DEFAULT '' NOT NULL,
	"phone" varchar(32) DEFAULT '' NOT NULL,
	"company" varchar(255) DEFAULT '' NOT NULL,
	"type" varchar(32) DEFAULT 'other' NOT NULL,
	"role" varchar(255) DEFAULT '' NOT NULL,
	"avatar" varchar(500),
	"nda_status" varchar(32) DEFAULT 'not_required' NOT NULL,
	"nda_document_id" varchar(64),
	"can_view_budget" boolean DEFAULT false NOT NULL,
	"can_view_leads" boolean DEFAULT false NOT NULL,
	"can_view_all_documents" boolean DEFAULT false NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(32) DEFAULT 'invited' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_venues" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"activation_id" varchar(64) NOT NULL,
	"name" varchar(500) NOT NULL,
	"address" varchar(500) DEFAULT '' NOT NULL,
	"city" varchar(255) DEFAULT '' NOT NULL,
	"state" varchar(64) DEFAULT '' NOT NULL,
	"zip" varchar(16) DEFAULT '' NOT NULL,
	"contact_name" varchar(255) DEFAULT '' NOT NULL,
	"contact_email" varchar(255) DEFAULT '' NOT NULL,
	"contact_phone" varchar(32) DEFAULT '' NOT NULL,
	"venue_type" varchar(64) DEFAULT '' NOT NULL,
	"capacity" integer DEFAULT 0 NOT NULL,
	"status" varchar(32) DEFAULT 'identified' NOT NULL,
	"walkthrough_date" timestamp,
	"walkthrough_notes" text DEFAULT '' NOT NULL,
	"booking_confirmed_at" timestamp,
	"booking_cost" integer DEFAULT 0 NOT NULL,
	"special_requirements" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(500) NOT NULL,
	"brand" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"color" varchar(16) DEFAULT '#f59e0b' NOT NULL,
	"icon" varchar(64) DEFAULT 'Zap' NOT NULL,
	"phase" varchar(32) DEFAULT 'planning' NOT NULL,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"event_date" timestamp NOT NULL,
	"event_end_date" timestamp,
	"setup_date" timestamp,
	"teardown_date" timestamp,
	"venue_id" varchar(64),
	"budget_total" integer DEFAULT 0 NOT NULL,
	"budget_spent" integer DEFAULT 0 NOT NULL,
	"lead_goal" integer DEFAULT 0 NOT NULL,
	"sample_goal" integer DEFAULT 0 NOT NULL,
	"interaction_goal" integer DEFAULT 0 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(255) DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_depends_on_id_tasks_id_fk" FOREIGN KEY ("depends_on_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_channel_id_chat_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."chat_channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_budget_items" ADD CONSTRAINT "activation_budget_items_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_checklists" ADD CONSTRAINT "activation_checklists_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_documents" ADD CONSTRAINT "activation_documents_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_issues" ADD CONSTRAINT "activation_issues_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_leads" ADD CONSTRAINT "activation_leads_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_media" ADD CONSTRAINT "activation_media_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_personnel" ADD CONSTRAINT "activation_personnel_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_products" ADD CONSTRAINT "activation_products_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_reports" ADD CONSTRAINT "activation_reports_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_run_of_show" ADD CONSTRAINT "activation_run_of_show_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_stakeholders" ADD CONSTRAINT "activation_stakeholders_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_venues" ADD CONSTRAINT "activation_venues_activation_id_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."activations"("id") ON DELETE cascade ON UPDATE no action;