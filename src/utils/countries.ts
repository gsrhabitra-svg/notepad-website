export interface Country {
  name: string;
  code: string; // ISO 2-letter code
  dialCode: string;
  flag: string;
  formatPlaceholder: string;
}

export const COUNTRIES: Country[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', formatPlaceholder: '98765 43210' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', formatPlaceholder: '(555) 000-0000' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', formatPlaceholder: '7911 123456' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', formatPlaceholder: '(555) 000-0000' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', formatPlaceholder: '412 345 678' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', formatPlaceholder: '151 12345678' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', formatPlaceholder: '6 12 34 56 78' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵', formatPlaceholder: '90 1234 5678' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬', formatPlaceholder: '9123 4567' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', formatPlaceholder: '50 123 4567' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', formatPlaceholder: '50 123 4567' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷', formatPlaceholder: '11 91234-5678' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳', formatPlaceholder: '138 0000 0000' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷', formatPlaceholder: '10 1234 5678' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱', formatPlaceholder: '6 12345678' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭', formatPlaceholder: '78 123 45 67' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪', formatPlaceholder: '70 123 45 67' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸', formatPlaceholder: '612 34 56 78' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹', formatPlaceholder: '320 123 4567' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿', formatPlaceholder: '21 123 4567' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦', formatPlaceholder: '71 123 4567' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽', formatPlaceholder: '55 1234 5678' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬', formatPlaceholder: '802 123 4567' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾', formatPlaceholder: '12-345 6789' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩', formatPlaceholder: '812-3456-7890' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪', formatPlaceholder: '85 123 4567' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱', formatPlaceholder: '512 345 678' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴', formatPlaceholder: '412 34 567' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰', formatPlaceholder: '20 12 34 56' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮', formatPlaceholder: '40 1234567' },
];

export const parsePhoneNumber = (fullNumber: string): { country: Country; localNumber: string } => {
  if (!fullNumber) {
    return { country: COUNTRIES[0], localNumber: '' };
  }

  const trimmed = fullNumber.trim();
  // Find matching dialCode (longest dial code match first)
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (trimmed.startsWith(c.dialCode)) {
      const rest = trimmed.slice(c.dialCode.length).trim();
      return { country: c, localNumber: rest };
    }
  }

  return { country: COUNTRIES[0], localNumber: trimmed.replace(/^\+/, '') };
};
