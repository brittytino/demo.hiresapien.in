import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import UserAccount from "@/models/UserAccount";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Default built-in credentials fallback (for offline or local demo development)
    const defaultAdminUsername = process.env.ADMIN_USERNAME || "admin";
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || "SonaAdmin2026!";

    let userAuthenticated = false;
    let userRole = "institution_admin";
    let userFullName = "Sona System Administrator";

    try {
      await connectDB();
      const user = await UserAccount.findOne({ username });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          userAuthenticated = true;
          userRole = user.role;
          userFullName = user.fullName || username;
        }
      }
    } catch (dbErr) {
      console.error("Auth DB connection failed, verifying against default hardcoded admin:", dbErr);
    }

    // If not authenticated by DB, check built-in fallback
    if (!userAuthenticated && username === defaultAdminUsername && password === defaultAdminPassword) {
      userAuthenticated = true;
    }

    if (!userAuthenticated) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Create session response
    const response = NextResponse.json({
      success: true,
      user: { username, role: userRole, fullName: userFullName }
    });

    // Save session in cookie
    response.cookies.set({
      name: "sona_admin_session",
      value: JSON.stringify({ username, role: userRole, fullName: userFullName }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2, // 2 hours expiry
      path: "/"
    });

    return response;
  } catch (error: any) {
    console.error("Login endpoint error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
