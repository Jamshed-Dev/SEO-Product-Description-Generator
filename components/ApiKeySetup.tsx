
import React, { useState } from 'react';

interface ApiKeySetupProps {
  onApiKeySubmit: (apiKey: string) => void;
  initialApiKey?: string; 
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySubmit, initialApiKey = '' }) => {
  const [inputApiKey, setInputApiKey] = useState<string>(initialApiKey);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputApiKey.trim()) {
      onApiKeySubmit(inputApiKey.trim());
      setError(null);
    } else {
      setError("API Key cannot be empty.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="p-8 sm:p-10 bg-slate-800 shadow-2xl rounded-2xl w-full max-w-md border border-slate-700">
        <h1 className="text-2xl sm:text-3xl font-bold text-rose-500 mb-6 text-center font-poppins">
          Set Up Gemini API Key
        </h1>
        <p className="text-slate-300 text-center mb-6 text-sm sm:text-base">
          Please enter your Google Gemini API key to use the application.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-1.5 font-poppins">
              Gemini API Key
            </label>
            <input
              type="password" 
              id="apiKey"
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              placeholder="Enter your API Key"
              className="w-full p-3.5 border border-slate-600 bg-slate-700 text-slate-50 rounded-lg shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition duration-150 ease-in-out placeholder-slate-400"
              required
              aria-label="Gemini API Key"
              aria-describedby={error ? "api-key-error" : undefined}
            />
            {error && <p id="api-key-error" className="mt-2 text-sm text-red-400">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center p-3 text-lg bg-rose-600 text-white rounded-lg shadow-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 ease-in-out font-poppins font-medium"
          >
            Save and Continue
          </button>
        </form>
        <p className="mt-6 text-xs text-slate-400 text-center">
          You can obtain an API key from{' '}
          <a 
            href="https://ai.google.dev/gemini-api/docs/api-key" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-rose-400 hover:underline"
          >
            Google AI Studio
          </a>.
          <br />
          Your API key is stored locally in your browser and is not sent to any server other than Google's.
        </p>
      </div>
    </div>
  );
};
