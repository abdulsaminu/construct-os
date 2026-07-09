const BASE = '/api';

export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) throw new Error('API Error');
  return res.json();
};

export const poster = async <T>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const putter = async <T>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(`${BASE}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const deleter = async <T>(url: string): Promise<T> => {
  const res = await fetch(`${BASE}${url}`, { method: 'DELETE' });
  return res.json();
};

// Spec-mandated financial formatter. Presentation only. No math.
const _fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const money = (value: string | number): string =>
  _fmt.format(Number(value));
