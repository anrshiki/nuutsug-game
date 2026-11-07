import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lrckernjwejjgzbldfat.supabase.co";
const supabaseKey = "sb_publishable_y3N8PQYnGelN4VsGU5G5Lg_HXJpgFf7";

export const supabase = createClient( supabaseUrl, supabaseKey);