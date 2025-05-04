import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/imageUpload';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const uploadResult = await uploadImage(image, { permanent: true });
    
    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 