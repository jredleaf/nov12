import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Ensure URLs are properly formatted
const supabaseUrl = 'https://gxkiubkgtkgvyidvuagh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4a2l1YmtndGtndnlpZHZ1YWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMzIwMTcsImV4cCI6MjA0NTgwODAxN30.i7hsj7Xtx0VehQEhY1K1JQ3Yjloyi06o7I7qFXavE_8';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

// Create a singleton instance
const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export const createClient = () => supabase;