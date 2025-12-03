import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchAction } from "convex/nextjs";
import { api } from "@packages/backend/convex/_generated/api";

const CSRF_COOKIE_NAME = "tiktok_oauth_state";
const CSRF_COOKIE_MAX_AGE = 600; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    // Get the base URL for redirect URI
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/oauth/tiktok/callback`;

    // Call initiateOAuth action
    const result = await fetchAction(api.actions.socialMedia.initiateOAuth, {
      platform: "tiktok",
      redirectUri,
    });

    // Store CSRF state in secure cookie
    const cookieStore = await cookies();
    cookieStore.set(CSRF_COOKIE_NAME, result.state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CSRF_COOKIE_MAX_AGE,
      path: "/",
    });

    // Redirect user to TikTok authorization URL
    return NextResponse.redirect(result.authUrl);
  } catch (error: any) {
    console.error("TikTok OAuth initiation error:", error);
    const errorMessage = error.message || "Failed to initiate OAuth";
    return NextResponse.redirect(
      new URL(
        `/settings/accounts?error=${encodeURIComponent(errorMessage)}`,
        request.url,
      ),
    );
  }
}

