import { NextResponse } from 'next/server';
import { processExpiredAuctions } from '@/lib/cron/auction';

export async function GET() {
  try {
    await processExpiredAuctions();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error running cron job:', error);
    return NextResponse.json({ success: false, error: 'Failed to process auctions' }, { status: 500 });
  }
} 