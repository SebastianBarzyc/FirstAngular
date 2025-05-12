import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tunvswqusvbtccadocdi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1bnZzd3F1c3ZidGNjYWRvY2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDAzODI5NiwiZXhwIjoyMDQ5NjE0Mjk2fQ.apcSjJ-PCfBhGULCeULwhVxNWKjnAnAqTu1UxcW8G9g';

export const supabase = createClient(supabaseUrl, supabaseKey);

export function getUser(): any {
  let session: any = null;
  let userId: any;
  let displayName: string | null = null;

  const storedSession = localStorage.getItem('session');
  if (storedSession) {
    session = JSON.parse(storedSession);
    userId = session.user.id;
    displayName = session.user.user_metadata?.['display_name'];
  }
  console.log("userId: ", userId, " displayName: ", displayName);
  return session.user;
}
