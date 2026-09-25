import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.js';
import { ThemeProvider } from './hooks/useTheme.js';
import { AuthScreen } from './components/auth/AuthScreen.js';
import { Workspace } from './pages/Workspace.js';
import { BookOpen } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121518] flex flex-col items-center justify-center text-[#212529] dark:text-[#E2DED6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-[#8C6D53]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#8C6D53]/30 border-t-[#8C6D53] rounded-full animate-spin" />
            <span className="font-['Literata'] text-sm font-medium tracking-tight">
              Loading Folio Sanctuary...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <Workspace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
