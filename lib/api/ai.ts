import { request } from './requests';

// Types
export interface GenerateImageRequest {
  prompt: string;
  negative_prompt?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  width?: number;
  height?: number;
}

export interface GenerateImageResponse {
  image: string; // base64 encoded image
  error?: string;
}

// API functions
export async function generateImage(
  data: GenerateImageRequest
): Promise<GenerateImageResponse> {
  return request<GenerateImageResponse>('/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
} 