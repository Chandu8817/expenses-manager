import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface LendBorrowRecord {
  id: string;
  user_id: string;
  person: string;
  amount: number;
  type: 'lent' | 'borrowed';
  date: string;
  due_date?: string;
  description: string;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}