import { NextResponse } from 'next/server';

const HF_API_ENDPOINTS = {
  TEXT_TO_IMAGE: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, negative_prompt, num_inference_steps, guidance_scale, width, height } = body;

    const response = await fetch(HF_API_ENDPOINTS.TEXT_TO_IMAGE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt,
          num_inference_steps: num_inference_steps || 50,
          guidance_scale: guidance_scale || 7.5,
          width: width || 512,
          height: height || 512,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to generate image' },
        { status: response.status }
      );
    }

    // Get the image data as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    // Convert to base64
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    // Add data URL prefix
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error) {
    console.error('AI image generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 