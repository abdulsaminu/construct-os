const BASE = '/api';
export const fetcher = async (url: string) => (await fetch(`${BASE}${url}`)).json();
export const poster = async (url: string, body: any) => (await fetch(`${BASE}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
