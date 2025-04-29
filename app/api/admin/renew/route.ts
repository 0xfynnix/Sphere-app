import { NextResponse } from 'next/server';
import { checkAndRenewImages } from '@/lib/renewal';

export async function GET() {
  try {
    await checkAndRenewImages();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in renewal API:', error);
    return NextResponse.json({ success: false, error: 'Failed to renew images' }, { status: 500 });
  }
} 