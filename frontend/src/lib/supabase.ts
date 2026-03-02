// Supabase REST API client using native fetch — no npm package needed.
// This avoids the Web Locks API (LockManager) used by @supabase/supabase-js auth,
// which causes SecurityError in ICP-hosted sandboxed frontends.

const SUPABASE_URL = 'https://ppebfdrluntbglqlreuz.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZWJmZHJsdW50YmdscWxyZXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjM1OTMsImV4cCI6MjA4Nzk5OTU5M30.3uk-txeUkdVxcPtAQ6lM58Px2rlpdqQTxVEter4Y_nA';

const REST_BASE = `${SUPABASE_URL}/rest/v1`;

const HEADERS: Record<string, string> = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

export interface MilkRecord {
  Date: string;
  MilkDelivered: 'Yes' | 'No';
  Packets: number;
}

export async function insertMilkRecord(record: MilkRecord): Promise<{ error: string | null }> {
  try {
    const response = await fetch(`${REST_BASE}/MilkDB`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        message = body?.message ?? body?.error ?? message;
      } catch {
        // ignore parse errors
      }
      return { error: message };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchAllMilkRecords(): Promise<{ data: MilkRecord[] | null; error: string | null }> {
  try {
    const response = await fetch(
      `${REST_BASE}/MilkDB?select=Date,MilkDelivered,Packets&order=Date.asc`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        message = body?.message ?? body?.error ?? message;
      } catch {
        // ignore parse errors
      }
      return { data: null, error: message };
    }

    const data: MilkRecord[] = await response.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
