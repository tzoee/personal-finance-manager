/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js'

// Supabase credentials - anon key is safe to expose (it's public)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mgppcwmpcdkfdufmojea.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncHBjd21wY2RrZmR1Zm1vamVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzQ1MTksImV4cCI6MjA4MjA1MDUxOX0.svaHDhU5C3Ao0jIN7QdW35sHzIy8kAQP5LDp02YYU9w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
