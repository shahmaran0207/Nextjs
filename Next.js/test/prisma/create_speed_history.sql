CREATE TABLE IF NOT EXISTS "link_speed_history" (
  "id" SERIAL PRIMARY KEY,
  "link_id" VARCHAR(20) NOT NULL,
  "speed" DOUBLE PRECISION NOT NULL,
  "recorded_at" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "link_speed_history_link_id_recorded_at_idx"
  ON "link_speed_history" ("link_id", "recorded_at");
