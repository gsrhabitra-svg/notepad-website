import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { label: 'New Notebook', keys: ['Ctrl', 'N'] },
    { label: 'Quick Search / Switcher', keys: ['Ctrl', 'F'] },
    { label: 'Force Save Document', keys: ['Ctrl', 'S'] },
    { label: 'Toggle Slide Menu', keys: ['Ctrl', 'D'] },
    { label: 'Bold Typography', keys: ['Ctrl', 'B'] },
    { label: 'Italic Typography', keys: ['Ctrl', 'I'] },
    { label: 'Underline Typography', keys: ['Ctrl', 'U'] },
    { label: 'Undo Last Action', keys: ['Ctrl', 'Z'] },
    { label: 'Redo Last Action', keys: ['Ctrl', 'Y'] },
    { label: 'Dismiss / Close Modal', keys: ['Esc'] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 text-[#212529] dark:text-[#E2DED6]">
      <div className="w-full max-w-[420px] bg-[#FAF9F6] dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] rounded-xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#8C6D53]">
            <Keyboard className="w-4 h-4" />
            <h3 className="font-['Literata'] text-lg font-medium text-[#212529] dark:text-[#FAF9F6]">
              Keyboard Shortcuts
            </h3>
            <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-[#EAE6DF] dark:bg-[#252A30] text-[#75777B]">
              Windows
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2 py-2">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-1 border-b border-[#E8E5DF]/60 dark:border-[#2E333A]/60 last:border-b-0"
            >
              <span className="text-[#5A6268] dark:text-[#A0A4A8]">{sc.label}</span>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                {sc.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="px-1.5 py-0.5 rounded bg-[#EAE6DF] dark:bg-[#252A30] text-[#212529] dark:text-[#FAF9F6] shadow-2xs border border-[#DED9D0] dark:border-[#383E46] min-w-[20px] text-center"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-1 py-1.5 rounded bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] text-xs font-medium hover:bg-[#343A40] transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
