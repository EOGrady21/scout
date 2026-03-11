-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         TEXT        PRIMARY KEY,
  name       TEXT,
  email      TEXT        NOT NULL UNIQUE,
  image      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL,
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  geom        geometry(Point, 4326),
  created_by  TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conditions table
CREATE TABLE IF NOT EXISTS conditions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id    UUID        NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id        TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  condition_date DATE        NOT NULL,
  rating         SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  description    TEXT        NOT NULL,
  photo_url      TEXT,
  tags           TEXT[]      NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS conditions
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- Badge catalog table
CREATE TABLE IF NOT EXISTS badges (
  id          TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL,
  icon_path   TEXT        NOT NULL,
  metric      TEXT        NOT NULL,
  target      INTEGER     NOT NULL CHECK (target > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-user badge progress and earned state
CREATE TABLE IF NOT EXISTS user_badges (
  user_id       TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id      TEXT        NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  current_value INTEGER     NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  earned        BOOLEAN     NOT NULL DEFAULT FALSE,
  earned_at     TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_locations_geom
  ON locations USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_locations_created_by
  ON locations (created_by);

CREATE INDEX IF NOT EXISTS idx_conditions_location_id
  ON conditions (location_id);

CREATE INDEX IF NOT EXISTS idx_conditions_user_id
  ON conditions (user_id);

CREATE INDEX IF NOT EXISTS idx_conditions_condition_date
  ON conditions (condition_date DESC);

CREATE INDEX IF NOT EXISTS idx_conditions_tags
  ON conditions USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id
  ON user_badges (user_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_earned
  ON user_badges (earned);
