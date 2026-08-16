import { AIProvider } from './types';
import { GeminiProvider } from './gemini';

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || 'gemini';
  
  if (providerType === 'gemini') {
    return new GeminiProvider();
  }
  
  throw new Error(`Unsupported AI Provider: ${providerType}`);
}
