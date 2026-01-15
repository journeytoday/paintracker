/*
  # Fix body_part_id constraint to allow general injuries

  ## Changes
  1. Make body_part_id nullable in injuries table
     - Allows users to create injuries without selecting a specific body part
     - Supports general pain tracking not tied to anatomy visualization

  ## Security
  - No changes to RLS policies
  - Maintains existing security model
*/

-- Make body_part_id nullable
ALTER TABLE injuries ALTER COLUMN body_part_id DROP NOT NULL;
