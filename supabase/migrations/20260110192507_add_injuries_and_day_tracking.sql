/*
  # Add Injury Tracking with Day-by-Day Progression

  ## Overview
  This migration adds support for tracking injuries over multiple days, allowing users to log
  pain progression for the same injury across days (Day 1, Day 2, Day 3, etc.).

  ## New Tables
  
  ### `injuries`
  Stores the main injury/condition being tracked:
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `body_part_id` (text) - Body part affected
  - `title` (text) - User-given name for the injury (e.g., "Left Knee Pain")
  - `created_at` (timestamptz) - When injury tracking started
  - `last_logged_at` (timestamptz) - Last time a log was added for this injury
  - `is_active` (boolean) - Whether injury is still being tracked (default true)

  ## Modified Tables
  
  ### `logs`
  Updated to support injury tracking:
  - Add `injury_id` (uuid, foreign key) - Links log to an injury
  - Add `day_number` (integer) - Day number in the injury progression (1, 2, 3, etc.)
  - Keep existing fields for backward compatibility

  ## Security
  - Enable RLS on injuries table
  - Add policies for users to manage their own injuries
  - Update logs policies to work with injuries

  ## Notes
  1. Existing logs without injury_id will still work (standalone logs)
  2. New logs created from scratch will create a new injury automatically
  3. "Track New Day" button will add a new log to an existing injury
  4. Users can mark injuries as inactive when healed
*/

-- Create injuries table
CREATE TABLE IF NOT EXISTS injuries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body_part_id text NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_logged_at timestamptz DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL
);

-- Add injury tracking fields to logs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logs' AND column_name = 'injury_id'
  ) THEN
    ALTER TABLE logs ADD COLUMN injury_id uuid REFERENCES injuries(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logs' AND column_name = 'day_number'
  ) THEN
    ALTER TABLE logs ADD COLUMN day_number integer DEFAULT 1;
  END IF;
END $$;

-- Enable RLS on injuries table
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;

-- Policies for injuries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'injuries' AND policyname = 'Users can view own injuries'
  ) THEN
    CREATE POLICY "Users can view own injuries"
      ON injuries FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'injuries' AND policyname = 'Users can create own injuries'
  ) THEN
    CREATE POLICY "Users can create own injuries"
      ON injuries FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'injuries' AND policyname = 'Users can update own injuries'
  ) THEN
    CREATE POLICY "Users can update own injuries"
      ON injuries FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'injuries' AND policyname = 'Users can delete own injuries'
  ) THEN
    CREATE POLICY "Users can delete own injuries"
      ON injuries FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_injuries_user_id ON injuries(user_id);
CREATE INDEX IF NOT EXISTS idx_injuries_is_active ON injuries(is_active);
CREATE INDEX IF NOT EXISTS idx_logs_injury_id ON logs(injury_id);
CREATE INDEX IF NOT EXISTS idx_logs_day_number ON logs(day_number);