export interface StorageUploadInput {
  buffer: Buffer;
  filename: string;
  contentType: string;
  userId: string;
}

export interface StorageProvider {
  name: string;
  upload(input: StorageUploadInput): Promise<{ url: string; sizeBytes: number }>;
  delete(url: string): Promise<void>;
  getUrl(path: string): string;
}
