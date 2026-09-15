import type {
  AIProvider,
  GenerateImageInput,
  GenerateImageOutput,
  GenerateVideoInput,
  GenerateVideoOutput,
  ImageToVideoInput,
} from "./types";

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1024&h=1024&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1024&h=1024&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1024&h=1024&fit=crop",
];

function getDimensions(aspectRatio?: string): { width: number; height: number } {
  switch (aspectRatio) {
    case "16:9":
      return { width: 1024, height: 576 };
    case "9:16":
      return { width: 576, height: 1024 };
    case "4:3":
      return { width: 1024, height: 768 };
    case "3:4":
      return { width: 768, height: 1024 };
    case "21:9":
      return { width: 1024, height: 438 };
    default:
      return { width: 1024, height: 1024 };
  }
}

export class MockAIProvider implements AIProvider {
  name = "mock";

  async generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    await new Promise((r) => setTimeout(r, 2000));
    const count = input.count ?? 1;
    const { width, height } = getDimensions(input.aspectRatio);
    const images = Array.from({ length: count }, (_, i) => ({
      url: DEMO_IMAGES[i % DEMO_IMAGES.length],
      width,
      height,
    }));
    return { images };
  }

  async generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
    await new Promise((r) => setTimeout(r, 3000));
    const count = input.count ?? 1;
    const duration = input.duration ?? 4;
    const videos = Array.from({ length: count }, () => ({
      url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      width: 1280,
      height: 720,
      durationMs: duration * 1000,
    }));
    return { videos };
  }

  async imageToVideo(input: ImageToVideoInput): Promise<GenerateVideoOutput> {
    await new Promise((r) => setTimeout(r, 3000));
    const duration = input.duration ?? 4;
    return {
      videos: [
        {
          url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          width: 1280,
          height: 720,
          durationMs: duration * 1000,
        },
      ],
    };
  }
}
