import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Perform a lightweight ping query on Supabase to keep the database active
    const { count, error } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Keep-alive ping error:', error);
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 'alive',
      message: 'Supabase database pinged successfully',
      rowCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown ping error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
