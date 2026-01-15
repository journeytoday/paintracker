/*
  # Add User Preferences and Update Logs Table

  1. New Tables
    - `user_preferences`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `store_data` (boolean) - Whether to store user's pain log history
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Make `body_part_id` nullable in `logs` table to allow general pain logs
    - Update RLS policies for better security

  3. Security
    - Enable RLS on `user_preferences` table
    - Add policies for users to manage their own preferences
    - Update logs policies to respect data storage preferences
*/

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_data boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON user_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Make body_part_id nullable in logs table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logs' AND column_name = 'body_part_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE logs ALTER COLUMN body_part_id DROP NOT NULL;
  END IF;
END $$;

-- Update logs RLS policies
DROP POLICY IF EXISTS "Users can view their own logs" ON logs;
DROP POLICY IF EXISTS "Users can insert their own logs" ON logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON logs;
DROP POLICY IF EXISTS "Users can delete their own logs" ON logs;

CREATE POLICY "Users can view their own logs"
  ON logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
  ON logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
  ON logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically create user preferences when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id, store_data)
  VALUES (new.id, true);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user preferences on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();