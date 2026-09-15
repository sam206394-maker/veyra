export interface GenerateImageInput {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  quality?: string;
  stylePreset?: string;
  count?: number;
}

export interface GenerateImageOutput {
  images: Array<{ url: string; width: number; height: number }>;
}

export interface GenerateVideoInput {
  prompt: string;
  negativePrompt?: string;
  duration?: number;
  quality?: string;
  stylePreset?: string;
  count?: number;
}

export interface GenerateVideoOutput {
  videos: Array<{
    url: string;
    width: number;
    height: number;
    durationMs: number;
  }>;
}

export interface ImageToVideoInput {
  imageUrl: string;
  prompt?: string;
  duration?: number;
  quality?: string;
}

export type ImageToVideoOutput = GenerateVideoOutput;

export interface AIProvider {
  name: string;
  generateImage(input: GenerateImageInput): Promise<GenerateImageOutput>;
  generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput>;
  imageToVideo(input: ImageToVideoInput): Promise<ImageToVideoOutput>;
}
