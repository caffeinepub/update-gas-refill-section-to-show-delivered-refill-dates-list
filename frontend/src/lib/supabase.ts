const SUPABASE_URL = 'https://ppebfdrluntbglqlreuz.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZWJmZHJsdW50YmdscWxyZXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjM1OTMsImV4cCI6MjA4Nzk5OTU5M30.3uk-txeUkdVxcPtAQ6lM58Px2rlpdqQTxVEter4Y_nA';

export interface MilkRecord {
  id?: number;
  date: string;
  milk_delivered: boolean;
  packets: number;
  created_at?: string;
}

export async function insertMilkRecord(
  record: Omit<MilkRecord, 'id' | 'created_at'>
): Promise<void> {
  let response: Response;
  try {
    response = await globalThis.fetch(`${SUPABASE_URL}/rest/v1/MilkDB`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(record),
    });
  } catch (networkErr) {
    throw new Error(
      `Network error while saving record: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`
    );
  }

  // Supabase returns 201 (with body) or 204 (no body) for successful inserts
  if (response.status !== 201 && response.status !== 204) {
    let message = `Insert failed with HTTP ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.message) message = parsed.message;
        else if (parsed.error) message = parsed.error;
        else message = text;
      }
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
}

export async function fetchAllMilkRecords(): Promise<MilkRecord[]> {
  let response: Response;
  try {
    response = await globalThis.fetch(
      `${SUPABASE_URL}/rest/v1/MilkDB?select=*&order=date.asc`,
      {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          Accept: 'application/json',
        },
      }
    );
  } catch (networkErr) {
    throw new Error(
      `Network error while fetching records: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`
    );
  }

  if (response.status !== 200) {
    let message = `Fetch failed with HTTP ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.message) message = parsed.message;
        else if (parsed.error) message = parsed.error;
        else message = text;
      }
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  try {
    return (await response.json()) as MilkRecord[];
  } catch {
    throw new Error('Failed to parse response from Supabase');
  }
}
