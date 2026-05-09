import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl, setAuthCookies } from "../cookies";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const backendResponse = await fetch(`${getBackendApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(payload, { status: backendResponse.status });
  }

  const data = payload.data;
  const safePayload = {
    ...payload,
    data: {
      ...data,
      refresh_token: undefined,
    },
  };
  const response = NextResponse.json(safePayload, { status: backendResponse.status });
  setAuthCookies(response, {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    role: data.user?.role,
    accountStatus: data.user?.accountStatus,
    expiresIn: data.expires_in,
  });

  return response;
}
