const API_BASE = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('folio_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('folio_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('folio_token');
};

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Invalid response from server',
  }));

  if (!response.ok) {
    if (response.status === 401) {
      // Discard invalid token
      removeAuthToken();
      window.dispatchEvent(new CustomEvent('folio:unauthorized'));
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}
