import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tunvswqusvbtccadocdi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1bnZzd3F1c3ZidGNjYWRvY2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDAzODI5NiwiZXhwIjoyMDQ5NjE0Mjk2fQ.apcSjJ-PCfBhGULCeULwhVxNWKjnAnAqTu1UxcW8G9g';

export const supabase = createClient(supabaseUrl, supabaseKey);

export function getUser() {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error("Token is null");
    return null;
  }

  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  const payload = JSON.parse(jsonPayload);

  return payload.sub; 
}
