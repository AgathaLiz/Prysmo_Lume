import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://binekdahtakvifxfewfi.supabase.co";
const supabaseAnonKey = "sb_publishable_FDtvOfU63-GtEH6-bxrzhA_CkUQcVwI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);