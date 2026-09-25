import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import { BookOpen, Lock, Mail, User as UserIcon, Eye, EyeOff, ArrowRight, CheckCircle2, Sun, Moon, Laptop } from 'lucide-react';
import { CountryPhoneInput } from '../common/CountryPhoneInput.js';
import { COUNTRIES, Country } from '../../utils/countries.js';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default India / can choose any
  const [phoneDigits, setPhoneDigits] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!phoneDigits.trim()) {
      setError('Mobile number is required');
      return;
    }

    const fullMobileNumber = `${selectedCountry.dialCode} ${phoneDigits.trim()}`;

    setLoading(true);
    try {
      await register({
        fullName,
        mobileNumber: fullMobileNumber,
        email,
        password,
        confirmPassword,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121518] text-[#212529] dark:text-[#E2DED6] flex flex-col justify-between p-6 md:p-12 selection:bg-[#EAE6DF] selection:text-[#212529]">
      {/* Top Brand Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] flex items-center justify-center shadow-sm">
            <BookOpen className="w-4 h-4 text-[#8C6D53]" />
          </div>
          <span className="font-['Literata'] text-xl font-medium tracking-tight text-[#212529] dark:text-[#FAF9F6]">
            Folio
          </span>
          <span className="text-xs text-[#8C6D53] font-mono tracking-wider ml-1">ARCHIVAL NOTEBOOK</span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          title={`Theme: ${theme}. Click to switch theme.`}
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
      </header>

      {/* Main Focus Card */}
      <main className="max-w-[460px] w-full mx-auto my-8 bg-white dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] rounded-xl shadow-[0_4px_24px_-4px_rgba(33,37,41,0.06)] p-8 md:p-10">
        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-[#E8E5DF] dark:border-[#2E333A] pb-3 mb-6">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                resetForm();
              }}
              className={`font-['Literata'] text-lg font-medium pb-2 -mb-3 transition-colors relative ${
                mode === 'login'
                  ? 'text-[#212529] dark:text-[#FAF9F6] border-b-2 border-[#8C6D53]'
                  : 'text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                resetForm();
              }}
              className={`font-['Literata'] text-lg font-medium pb-2 -mb-3 transition-colors relative ${
                mode === 'register'
                  ? 'text-[#212529] dark:text-[#FAF9F6] border-b-2 border-[#8C6D53]'
                  : 'text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded text-red-800 dark:text-red-300 text-xs leading-relaxed flex items-start gap-2">
            <span className="font-semibold shrink-0">Note:</span>
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#44474A] dark:text-[#A0A4A8] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#75777B] absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@vault.com"
                  className="w-full bg-[#FAF9F6] dark:bg-[#121518] text-[#212529] dark:text-[#FAF9F6] border border-[#E2DED6] dark:border-[#2E333A] rounded pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-[#8C6D53] transition-colors placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44474A] dark:text-[#A0A4A8] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#75777B] absolute left-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF9F6] dark:bg-[#121518] text-[#212529] dark:text-[#FAF9F6] border border-[#E2DED6] dark:border-[#2E333A] rounded pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#8C6D53] transition-colors placeholder:text-[#9CA3AF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] hover:bg-[#343A40] dark:hover:bg-[#EAE6DF] font-medium py-2.5 px-4 rounded text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Open Notebook</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#44474A] dark:text-[#A0A4A8] mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-[#75777B] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-[#FAF9F6] dark:bg-[#121518] text-[#212529] dark:text-[#FAF9F6] border border-[#E2DED6] dark:border-[#2E333A] rounded pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:border-[#8C6D53] transition-colors placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44474A] dark:text-[#A0A4A8] mb-1 uppercase tracking-wider">
                Country & Mobile Number
              </label>
              <CountryPhoneInput
                selectedCountry={selectedCountry}
                onSelectCountry={setSelectedCountry}
                phoneValue={phoneDigits}
                onPhoneChange={setPhoneDigits}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44474A] dark:text-[#A0A4A8] mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#75777B] absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#FAF9F6] dark:bg-[#121518] text-[#212529] dark:text-[#FAF9F6] border border-[#E2DED6] dark:border-[#2E333A] rounded pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:border-[#8C6D53] transition-colors placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#44474A] dark:text-[#A0A4A8] mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-[#FAF9F6] dark:bg-[#121518] text-[#212529] dark:text-[#FAF9F6] border border-[#E2DED6] dark:border-[#2E333A] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#8C6D53] transition-colors placeholder:text-[#9CA3AF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-[#75777B] hover:text-[#212529]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#44474A] dark:text-[#A0A4A8] mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#FAF9F6] dark:bg-[#121518] text-[#212529] dark:text-[#FAF9F6] border border-[#E2DED6] dark:border-[#2E333A] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#8C6D53] transition-colors placeholder:text-[#9CA3AF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 text-[#75777B] hover:text-[#212529]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] hover:bg-[#343A40] dark:hover:bg-[#EAE6DF] font-medium py-2.5 px-4 rounded text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Registering Account...
                </span>
              ) : (
                <>
                  <span>Create Private Workspace</span>
                  <CheckCircle2 className="w-4 h-4 text-[#8C6D53]" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-[#E8E5DF] dark:border-[#2E333A] flex items-center justify-center text-xs text-[#75777B]">
          <span>Archival Privacy · End-to-End User Data Isolation</span>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="text-center text-xs text-[#75777B] py-4">
        <span>Folio Digital Notebook · Designed for sustained writing flow</span>
      </footer>
    </div>
  );
};
