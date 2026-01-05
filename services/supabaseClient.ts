import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hwdsydxffdllhlaxpxsz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZHN5ZHhmZmRsbGhsYXhweHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTMyNDIsImV4cCI6MjA4MzE4OTI0Mn0.rX3-HQDPVQzs1cbvkLfkB2xT_ttUzqqg9w1a_QjuVMY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
