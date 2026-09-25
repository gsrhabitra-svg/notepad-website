import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import {
  BookOpen,
  Search,
  Settings,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Keyboard,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';

interface AppHeaderProps {
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenSearch,
  onOpenSettings,
  onOpenShortcuts,
  isSidebarCollapsed,
  onToggleSidebar,
  theme,
  onThemeChange,
}) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [userMenuOpen]);

  return (
    <header className="h-14 bg-[#FAF9F6]/90 dark:bg-[#121518]/90 backdrop-blur-xl border-b border-[#E8E5DF] dark:border-[#2E333A] px-4 md:px-6 flex items-center justify-between z-30 select-none text-[#212529] dark:text-[#E2DED6]">
      {/* Zone 1: Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? 'Open Slide Menu (Ctrl+D)' : 'Collapse Slide Menu (Ctrl+D)'}
          className="w-8 h-8 rounded text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#EAE6DF] dark:hover:bg-[#1E2328] flex items-center justify-center transition-colors"
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-4 h-4 text-[#8C6D53]" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-[#8C6D53]" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] flex items-center justify-center shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-[#8C6D53]" />
          </div>
          <span className="font-['Literata'] text-lg font-medium tracking-tight text-[#212529] dark:text-[#FAF9F6]">
            Folio
          </span>
        </div>
      </div>

      {/* Zone 2: Search Trigger */}
      <div className="flex items-center gap-2 max-w-sm w-full mx-4">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#F4F3F0] dark:bg-[#1A1E22] hover:bg-[#EAE6DF] dark:hover:bg-[#252A30] border border-[#E2DED6] dark:border-[#2E333A] text-xs text-[#75777B] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#8C6D53]" />
            <span className="truncate">Search notes, topics, prose...</span>
          </div>
          <kbd className="hidden sm:inline-block font-mono text-[10px] bg-[#EAE6DF] dark:bg-[#2E333A] text-[#5A6268] dark:text-[#A0A4A8] px-1.5 py-0.5 rounded shadow-2xs">
            Ctrl+F
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions & User Capsule */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (Windows)"
          className="w-8 h-8 rounded text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#EAE6DF] dark:hover:bg-[#1E2328] flex items-center justify-center transition-colors"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
            onThemeChange(next);
          }}
          title={`Theme: ${theme}`}
          className="w-8 h-8 rounded text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#EAE6DF] dark:hover:bg-[#1E2328] flex items-center justify-center transition-colors"
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4 text-[#8C6D53]" />
          ) : theme === 'dark' ? (
            <Moon className="w-4 h-4 text-[#8C6D53]" />
          ) : (
            <Laptop className="w-4 h-4 text-[#8C6D53]" />
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-[#EAE6DF] dark:hover:bg-[#1E2328] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] font-medium text-xs flex items-center justify-center font-mono">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:inline-block text-xs font-medium text-[#212529] dark:text-[#FAF9F6] max-w-[100px] truncate">
              {user?.fullName}
            </span>
          </button>

          {/* User Popover Menu */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] rounded-xl shadow-xl py-1 z-50 text-xs text-[#212529] dark:text-[#E2DED6] animate-in fade-in duration-100">
              <div className="px-3.5 py-2.5 border-b border-[#E8E5DF] dark:border-[#2E333A] flex flex-col">
                <span className="font-semibold text-[#212529] dark:text-[#FAF9F6] truncate">
                  {user?.fullName}
                </span>
                <span className="text-[11px] text-[#75777B] font-mono truncate">
                  {user?.email}
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-[#F4F3F0] dark:hover:bg-[#252A30] text-left transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#8C6D53]" />
                  <span>Workspace Preferences</span>
                </button>
              </div>

              <div className="border-t border-[#E8E5DF] dark:border-[#2E333A] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-left transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
