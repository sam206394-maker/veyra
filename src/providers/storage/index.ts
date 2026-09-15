import type { StorageProvider } from "./types";
import { LocalStorageProvider } from "./local";

let _provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (_provider) return _provider;

  const provider = process.env.STORAGE_PROVIDER;

  switch (provider) {
    case "local":
    default:
      _provider = new LocalStorageProvider();
      return _provider;
  }
}

export type { StorageProvider } from "./types";
export { LocalStorageProvider } from "./local";
