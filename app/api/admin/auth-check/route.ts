import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sona_admin_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    return NextResponse.json({ authenticated: true, user: sessionData });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
