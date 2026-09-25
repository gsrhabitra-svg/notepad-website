import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Book, FileText, ArrowRight } from 'lucide-react';
import { SearchResult, NotebookNode } from '../../types/index.js';
import { userApi } from '../../services/userApi.js';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (nodeId: string) => void;
  allNodes: NotebookNode[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  allNodes,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Live search with 250ms debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      userApi
        .search(query.trim())
        .then((res) => {
          setResults(res);
          setSelectedIndex(0);
        })
        .catch((err) => {
          console.error('Search error:', err);
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation inside search results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectResult(results[selectedIndex].nodeId);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-[580px] bg-[#FAF9F6] dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] rounded-xl shadow-2xl overflow-hidden flex flex-col text-[#212529] dark:text-[#E2DED6]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#E8E5DF] dark:border-[#2E333A] gap-2.5">
          <Search className="w-4 h-4 text-[#8C6D53] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, chapters, topics, and manuscript prose..."
            className="flex-1 bg-transparent text-sm text-[#212529] dark:text-[#FAF9F6] outline-none placeholder:text-[#9CA3AF]"
          />
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-[#8C6D53]/30 border-t-[#8C6D53] rounded-full animate-spin shrink-0" />
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-[#75777B]">
              Type a title, concept, or snippet to search your private notebook library.
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-8 text-center text-xs text-[#75777B]">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {results.map((res, idx) => {
                const isSelected = idx === selectedIndex;
                const node = allNodes.find((n) => n._id === res.nodeId);
                const isRoot = node && !node.parentId;

                return (
                  <div
                    key={res.nodeId}
                    onClick={() => {
                      onSelectResult(res.nodeId);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-start justify-between p-3 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#212529] dark:text-[#FAF9F6]'
                        : 'hover:bg-[#F4F3F0] dark:hover:bg-[#1E2328]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
                      <span className="mt-0.5 text-[#8C6D53] shrink-0">
                        {isRoot ? <Book className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium tracking-tight truncate">
                          {res.nodeTitle}
                        </span>
                        <p className="text-xs text-[#5A6268] dark:text-[#A0A4A8] line-clamp-1 mt-0.5 font-['Literata']">
                          {res.snippet}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      <span className="text-[10px] font-mono uppercase text-[#75777B] bg-[#F4F3F0] dark:bg-[#121518] px-1.5 py-0.5 rounded">
                        {res.matchedIn}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#75777B]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-[#F4F3F0] dark:bg-[#121518] border-t border-[#E8E5DF] dark:border-[#2E333A] flex items-center justify-between text-[11px] text-[#75777B] font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ to navigate</span>
            <span>·</span>
            <span>↵ to select</span>
          </div>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
