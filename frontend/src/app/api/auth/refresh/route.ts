import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl, REFRESH_COOKIE, setAuthCookies } from "../cookies";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ status: "gagal", message: "Sesi tidak tersedia" }, { status: 401 });
  }

  const backendResponse = await fetch(`${getBackendApiUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  const payload = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(payload, { status: backendResponse.status });
  }

  const statusResponse = await fetch(`${getBackendApiUrl()}/auth/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  const statusPayload = statusResponse.ok ? await statusResponse.json() : null;
  const user = statusPayload?.data?.user ?? null;
  const data = payload.data;
  const response = NextResponse.json({ ...payload, data: { ...data, user } }, { status: backendResponse.status });

  setAuthCookies(response, {
    accessToken: data.access_token,
    role: user?.role,
    accountStatus: user?.accountStatus,
    expiresIn: data.expires_in,
  });

  return response;
}
