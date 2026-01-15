/*
  # Create Storage Bucket for Pain Images

  1. Storage
    - Create a storage bucket named 'pain-images'
    - Enable public access for the bucket
    - Add policies for authenticated users to upload and view their own images

  2. Security
    - Users can only upload to their own folder (user_id)
    - Users can view their own images
    - Images are publicly accessible via URL
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('pain-images', 'pain-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pain-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pain-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can view all images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'pain-images');