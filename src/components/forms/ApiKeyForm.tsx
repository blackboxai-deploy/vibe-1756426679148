"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface ApiKeyFormProps {
  onSubmit: (key: string) => Promise<void>;
}

export function ApiKeyForm({ onSubmit }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsValidating(true);
    try {
      await onSubmit(apiKey.trim());
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="apiKey" className="text-white">
          OpenAI API Key
        </Label>
        <div className="relative">
          <Input
            id="apiKey"
            type={showKey ? "text" : "password"}
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-gray-400 space-y-2">
        <p>• Get your API key from OpenAI's platform</p>
        <p>• Your key is stored locally and never sent to our servers</p>
        <p>• You'll be charged directly by OpenAI for usage</p>
      </div>

      <Button
        type="submit"
        disabled={!apiKey.trim() || isValidating}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isValidating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Validating...
          </>
        ) : (
          'Validate & Save'
        )}
      </Button>
    </form>
  );
}