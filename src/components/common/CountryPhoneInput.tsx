import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRIES, Country } from '../../utils/countries.js';

interface CountryPhoneInputProps {
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
  phoneValue: string;
  onPhoneChange: (val: string) => void;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  selectedCountry,
  onSelectCountry,
  phoneValue,
  onPhoneChange,
  required = true,
  disabled = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownOpen]);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center w-full bg-[#FAF9F6] dark:bg-[#121518] border border-[#E2DED6] dark:border-[#2E333A] rounded transition-colors focus-within:border-[#8C6D53]">
        {/* Country Selector Dropdown Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            setSearchQuery('');
          }}
          className="flex items-center gap-1.5 px-3 py-2 border-r border-[#E2DED6] dark:border-[#2E333A] bg-[#F4F3F0] dark:bg-[#1A1E22] hover:bg-[#EAE6DF] dark:hover:bg-[#252A30] text-xs font-medium text-[#212529] dark:text-[#FAF9F6] rounded-l transition-colors shrink-0"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="font-mono text-xs">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-3 h-3 text-[#75777B]" />
        </button>

        {/* Local Mobile Number Input */}
        <input
          type="tel"
          required={required}
          disabled={disabled}
          value={phoneValue}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder={selectedCountry.formatPlaceholder}
          className="w-full bg-transparent text-[#212529] dark:text-[#FAF9F6] px-3.5 py-2 text-sm focus:outline-none placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* Country Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute left-0 top-full mt-1 w-72 max-w-[90vw] bg-white dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] rounded-xl shadow-2xl py-2 z-50 text-xs text-[#212529] dark:text-[#E2DED6] animate-in fade-in duration-100">
          {/* Search Field inside dropdown */}
          <div className="px-3 pb-2 border-b border-[#E8E5DF] dark:border-[#2E333A]">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#75777B] absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                className="w-full bg-[#F4F3F0] dark:bg-[#121518] text-[#212529] dark:text-[#FAF9F6] pl-8 pr-2.5 py-1.5 rounded text-xs outline-none border border-[#E2DED6] dark:border-[#2E333A] focus:border-[#8C6D53]"
              />
            </div>
          </div>

          {/* List of Countries */}
          <div className="max-h-56 overflow-y-auto pt-1">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-3 text-center text-[#75777B]">
                No country found matching "{searchQuery}"
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.code === selectedCountry.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onSelectCountry(country);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#F4F3F0] dark:hover:bg-[#252A30] transition-colors ${
                      isSelected
                        ? 'bg-[#EAE6DF] dark:bg-[#252A30] font-medium text-[#212529] dark:text-[#FAF9F6]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-base leading-none">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#75777B] shrink-0">
                      {country.dialCode}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
