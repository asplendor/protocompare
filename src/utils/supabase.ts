import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Comparison {
  left_html: string | null;
  right_html: string | null;
  expires_at: string;
}

/**
 * Save a comparison to Supabase and return its UUID.
 * Either side can be null (share works with just one side loaded).
 */
export async function saveComparison(
  leftHTML: string | null,
  rightHTML: string | null,
): Promise<string> {
  const { data, error } = await supabase
    .from('comparisons')
    .insert({ left_html: leftHTML, right_html: rightHTML })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('Failed to save comparison. Please try again.');
  }
  return data.id as string;
}

/**
 * Fetch a comparison by UUID.
 * Expired rows are invisible via RLS policy (expires_at > now()),
 * so a missing result means either not found or expired.
 */
export async function fetchComparison(id: string): Promise<Comparison> {
  const { data, error } = await supabase
    .from('comparisons')
    .select('left_html, right_html, expires_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('Comparison not found or has expired.');
  }
  return data as Comparison;
}
