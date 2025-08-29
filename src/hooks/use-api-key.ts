import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'openai_api_key';
const ENCRYPTION_KEY = 'ai-image-gen-2024';

interface ApiKeyState {
  apiKey: string | null;
  isValidated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useApiKey() {
  const [state, setState] = useState<ApiKeyState>({
    apiKey: null,
    isValidated: false,
    isLoading: false,
    error: null,
  });

  // Load API key from localStorage on mount
  useEffect(() => {
    const loadStoredKey = () => {
      try {
        const encrypted = localStorage.getItem(STORAGE_KEY);
        if (encrypted) {
          const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
          if (decrypted && decrypted.startsWith('sk-')) {
            setState(prev => ({
              ...prev,
              apiKey: decrypted,
              isValidated: true,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading API key:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadStoredKey();
  }, []);

  const validateApiKey = async (key: string): Promise<boolean> => {
    if (!key || !key.startsWith('sk-')) {
      setState(prev => ({ ...prev, error: 'Invalid API key format' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: key }),
      });

      const result = await response.json();

      if (result.valid) {
        setState(prev => ({
          ...prev,
          apiKey: key,
          isValidated: true,
          isLoading: false,
          error: null,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isValidated: false,
          isLoading: false,
          error: result.error || 'Invalid API key',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isValidated: false,
        isLoading: false,
        error: 'Failed to validate API key',
      }));
      return false;
    }
  };

  const saveApiKey = (key: string) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(key, ENCRYPTION_KEY).toString();
      localStorage.setItem(STORAGE_KEY, encrypted);
      setState(prev => ({
        ...prev,
        apiKey: key,
        isValidated: true,
        error: null,
      }));
    } catch (error) {
      console.error('Error saving API key:', error);
      setState(prev => ({ ...prev, error: 'Failed to save API key' }));
    }
  };

  const removeApiKey = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setState({
        apiKey: null,
        isValidated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error removing API key:', error);
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    apiKey: state.apiKey,
    isValidated: state.isValidated,
    isLoading: state.isLoading,
    error: state.error,
    validateApiKey,
    saveApiKey,
    removeApiKey,
    clearError,
    hasApiKey: !!state.apiKey,
  };
}