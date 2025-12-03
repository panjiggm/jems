import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchAction } from "convex/nextjs";
import { api } from "@packages/backend/convex/_generated/api";

const CSRF_COOKIE_NAME = "tiktok_oauth_state";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state") as string;
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings/accounts?error=${error}`, request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings/accounts?error=no_code", request.url),
    );
  }

  if (!state) {
    return NextResponse.redirect(
      new URL("/settings/accounts?error=no_state", request.url),
    );
  }

  // Validate CSRF state from cookie
  const cookieStore = await cookies();
  const storedState = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!storedState || storedState !== state) {
    // Clear the cookie if it exists
    cookieStore.delete(CSRF_COOKIE_NAME);
    return NextResponse.redirect(
      new URL("/settings/accounts?error=invalid_state", request.url),
    );
  }

  // Clear the CSRF cookie after validation
  cookieStore.delete(CSRF_COOKIE_NAME);

  try {
    // Complete OAuth
    const result = await fetchAction(api.actions.socialMedia.completeOAuth, {
      platform: "tiktok",
      code,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/tiktok/callback`,
      state,
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL(
        `/settings/accounts?success=tiktok&account=${result.accountId}`,
        request.url,
      ),
    );
  } catch (error: any) {
    console.error("TikTok OAuth error:", error);
    return NextResponse.redirect(
      new URL(
        `/settings/accounts?error=${encodeURIComponent(error.message)}`,
        request.url,
      ),
    );
  }
}
