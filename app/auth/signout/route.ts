import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await supabase.auth.signOut();
  }

  // Get the origin for redirect
  const origin = request.headers.get('origin') || 'http://localhost:3000';
  return Response.redirect(`${origin}/login`, 302);
}
