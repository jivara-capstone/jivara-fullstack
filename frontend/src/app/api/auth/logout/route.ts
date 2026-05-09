import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookies, getBackendApiUrl, REFRESH_COOKIE } from '../cookies';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${getBackendApiUrl()}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    }).catch(() => {});
  }

  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  clearAuthCookies(response);
  response.headers.set('Clear-Site-Data', '"cache"');
  return response;
}
