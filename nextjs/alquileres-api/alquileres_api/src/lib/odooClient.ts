import 'dotenv/config';

let sessionId: string | null = null;

async function authenticate(forceRefresh = false): Promise<string> {
  if (sessionId && !forceRefresh) {
    return sessionId;
  }

  
  const response = await fetch(`${process.env.API_ODOO_URL}/web/session/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      params: {
        db: process.env.API_ODOO_DATABASE,
        login: process.env.API_ODOO_LIMITED_WEB_USER,
        password: process.env.API_ODOO_LIMITED_WEB_USER_PASSWORD,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Odoo authentication failed: ${response.status}`);
  }

  const cookies = response.headers.get('set-cookie');
  if (!cookies) {
    throw new Error('No session cookie received from Odoo');
  }

  const match = cookies.match(/session_id=([^;]+)/);
  if (!match) {
    throw new Error('session_id not found in Odoo response cookies');
  }

  sessionId = match[1];
  return sessionId;
}

async function fetchOdoo(path: string, init: RequestInit, retry = true): Promise<Response> {
  const sid = await authenticate();
  const headers = {
    'Content-Type': 'application/json',
    Cookie: `session_id=${sid}`,
    ...(init.headers as Record<string, string>),
  };

  const response = await fetch(`${process.env.API_ODOO_URL}${path}`, { ...init, headers });

  if (response.status === 401 && retry) {
    sessionId = null;
    return fetchOdoo(path, init, false);
  }

  return response;
}

export async function odooGet(path: string): Promise<any> {
  const response = await fetchOdoo(path, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Odoo GET ${path} failed: ${response.status}`);
  }

  return response.json();
}

export async function odooPost(path: string, params: object): Promise<any> {
  const response = await fetchOdoo(path, {
    method: 'POST',
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params }),
  });

  if (!response.ok) {
    const text = await response.text();
    let errorData: any;
    try { errorData = JSON.parse(text); } catch { errorData = { error: text }; }
    throw new Error(errorData.error || errorData.message || `Odoo POST ${path} failed: ${response.status}`);
  }

  return response.json();
}

export async function odooEntityPost(entity: string, endpoint = '', params: object = {}): Promise<any> {
  const path = `/api/v1/reservation/${entity}/${endpoint}`;
  const response = await fetchOdoo(path, {
    method: 'POST',
    body: JSON.stringify({ params }),
  });

  if (!response.ok) {
    throw new Error(`Odoo entity POST ${path} failed: ${response.status}`);
  }

  return response.json();
}
