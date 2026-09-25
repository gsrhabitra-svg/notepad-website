import React from 'react';
import { SaveStatus } from '../../types/index.js';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  errorMessage,
  onRetry,
}) => {
  if (status === 'saving') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F4F3F0] dark:bg-[#1E2328] text-xs text-[#5A6268] dark:text-[#A0A4A8]">
        <RefreshCw className="w-3 h-3 text-[#8C6D53] animate-spin" />
        <span className="font-mono text-[11px]">Saving...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={onRetry}
        title={errorMessage || 'Failed to save note. Click to retry'}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors cursor-pointer"
      >
        <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
        <span className="font-mono text-[11px] font-medium">Unable to save · Retry</span>
      </button>
    );
  }

  if (status === 'unsaved') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F4F3F0] dark:bg-[#1E2328] text-xs text-[#75777B]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-mono text-[11px]">Unsaved changes</span>
      </div>
    );
  }

  // Saved state
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F4F3F0] dark:bg-[#1E2328] text-xs text-[#5A6268] dark:text-[#A0A4A8]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D53]" />
      <span className="font-mono text-[11px]">Saved</span>
    </div>
  );
};
