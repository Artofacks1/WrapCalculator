'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { AIConfidenceInput, AIConfidenceOutput } from '@/lib/types';

interface AIConfidenceCheckProps {
  input: AIConfidenceInput;
  onResult: (result: AIConfidenceOutput) => void;
  disabled?: boolean;
}

export default function AIConfidenceCheck({
  input,
  onResult,
  disabled = false,
}: AIConfidenceCheckProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/confidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get confidence check');
      }

      const result: AIConfidenceOutput = await response.json();
      onResult(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => {
          if (disabled && !loading) {
            // If disabled due to subscription, don't call handleCheck
            // The parent component will show the upgrade message
            return;
          }
          if (!disabled && !loading) {
            handleCheck();
          }
        }}
        disabled={loading}
        className={cn(
          "px-4 py-2 rounded-md text-sm transition-colors",
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        )}
      >
        {loading ? 'Checking...' : 'AI Confidence Check'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export function AIConfidenceResult({ result }: { result: AIConfidenceOutput }) {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'SAFE':
        return 'text-green-800 bg-green-100 border-green-300';
      case 'AGGRESSIVE':
        return 'text-yellow-800 bg-yellow-100 border-yellow-300';
      case 'RISKY':
        return 'text-red-800 bg-red-100 border-red-300';
      default:
        return 'text-gray-800 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className={`mt-4 p-4 rounded-lg border ${getRatingColor(result.rating)}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">AI Confidence: {result.rating}</h3>
      </div>

      {result.reasons.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-2">Reasons:</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {result.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {result.suggestedAdjustments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Suggested Adjustments:</h4>
          <ul className="space-y-2">
            {result.suggestedAdjustments.map((adj, idx) => (
              <li key={idx} className="text-sm">
                <span className="font-medium">{adj.field}:</span> {adj.change} -{' '}
                {adj.rationale}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

