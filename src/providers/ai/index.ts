import type { AIProvider } from "./types";
import { MockAIProvider } from "./mock";

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_provider) return _provider;

  const provider = process.env.AI_PROVIDER;
  const apiKey = process.env.AI_API_KEY;

  if (!provider || !apiKey) {
    console.log("[Veyra] No AI provider configured, using mock provider");
    _provider = new MockAIProvider();
    return _provider;
  }

  switch (provider.toLowerCase()) {
    default:
      console.log(
        `[Veyra] Unknown provider "${provider}", falling back to mock`
      );
      _provider = new MockAIProvider();
      return _provider;
  }
}

export type { AIProvider } from "./types";
export { MockAIProvider } from "./mock";
