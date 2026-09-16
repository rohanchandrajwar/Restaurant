import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  detectSessionInUrl: true,
  flowType: 'implicit',
  // Suppress the async storage warning in console
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// UPI payment configuration — restaurant's UPI ID
export const UPI_CONFIG = {
  payeeVpa: 'spicegarden@upi',
  payeeName: 'Spice Garden Restaurant',
};
