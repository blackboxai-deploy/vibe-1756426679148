import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'openai_api_key';
const ENCRYPTION_KEY = 'ai-image-gen-2024';

export interface ApiKeyValidationResult {
  isValid: boolean;
  error?: string;
  model?: string;
}

export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private apiKey: string | null = null;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
    this.saveToStorage(key);
  }

  public getApiKey(): string | null {
    return this.apiKey;
  }

  public hasApiKey(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  public clearApiKey(): void {
    this.apiKey = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  private saveToStorage(key: string): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(key, ENCRYPTION_KEY).toString();
      localStorage.setItem(STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (encrypted) {
        const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
        this.apiKey = decrypted.toString(CryptoJS.enc.Utf8);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  public async validateApiKey(key: string): Promise<ApiKeyValidationResult> {
    if (!key || !key.startsWith('sk-')) {
      return {
        isValid: false,
        error: 'Invalid API key format. OpenAI API keys start with "sk-"'
      };
    }

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: key }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          isValid: true,
          model: result.model || 'dall-e-3'
        };
      } else {
        return {
          isValid: false,
          error: result.error || 'Failed to validate API key'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  public isValidKeyFormat(key: string): boolean {
    return key.startsWith('sk-') && key.length > 20;
  }

  public maskApiKey(key: string): string {
    if (!key || key.length < 8) return '••••••••';
    return key.substring(0, 7) + '••••••••' + key.substring(key.length - 4);
  }
}

export const apiKeyManager = ApiKeyManager.getInstance();