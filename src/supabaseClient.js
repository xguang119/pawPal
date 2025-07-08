
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucpyfwywpjmhcuofpyji.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHlmd3l3cGptaGN1b2ZweWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTAwODQsImV4cCI6MjA2NzA4NjA4NH0.Hd_beBQSK6PMqkfwPtwwNM3ZjWnDfmAA7izNepSaDRE'

export const supabase = createClient(supabaseUrl, supabaseKey)
