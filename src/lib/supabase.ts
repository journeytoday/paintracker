import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      logs: {
        Row: {
          id: string;
          user_id: string;
          body_part_id: string | null;
          pain_level: number | null;
          note: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          body_part_id?: string | null;
          pain_level?: number | null;
          note?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          body_part_id?: string | null;
          pain_level?: number | null;
          note?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          store_data: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          store_data?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          store_data?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
