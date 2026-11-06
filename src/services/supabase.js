import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env ? process.env : {});

const rawUrl = env.VITE_SUPABASE_URL || 'https://mvufpjwmuphzgykpaswn.supabase.co';
const rawKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_XpK4NxgXZHsxexCGArNHnA_cV3RDBc1';

// Clean URL: strip /rest/v1 if passed by mistake
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '').trim();
export const supabaseAnonKey = rawKey.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Resilient client instance
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const STORAGE_BUCKET = 'exam-papers';

/**
 * Increment paper download count using Supabase RPC or direct DB update
 */
export async function trackDownload(paperId) {
  if (!paperId || !isSupabaseConfigured) return;
  try {
    const { error } = await supabase.rpc('increment_download', { paper_id: paperId });
    if (error) {
      // Fallback: direct increment if RPC is not installed
      const { data } = await supabase
        .from('exam_papers')
        .select('download_count')
        .eq('id', paperId)
        .single();
      if (data) {
        await supabase
          .from('exam_papers')
          .update({ download_count: (data.download_count || 0) + 1 })
          .eq('id', paperId);
      }
    }
  } catch (err) {
    console.warn('Track download notice:', err.message);
  }
}
