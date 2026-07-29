import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjynvwqfbjhaqosohekb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeW52d3FmYmpoYXFvc29oZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTQ5MjEsImV4cCI6MjA5OTg3MDkyMX0.7HFuKG-SYY-N0RrHre5rIOyJ65dge1k-kfcGHpyOd4Q';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
