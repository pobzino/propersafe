import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isStaff } from "@/lib/auth/staff";

// Proxy (formerly Middleware before Next 16) runs an *optimistic* gate only:
// it redirects obviously-unauthorized requests before they reach the app. The
// authoritative staff check lives in app/(internal)/layout.tsx, which re-validates
// the user server-side on every internal page render.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isInternalRoute = request.nextUrl.pathname.startsWith("/dashboard")
    || request.nextUrl.pathname.startsWith("/cases")
    || request.nextUrl.pathname.startsWith("/professionals");

  if (isInternalRoute && (!user || !isStaff(user.email))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Only bounce an already-signed-in *staff* user away from /login. A non-staff
  // session (e.g. a magic-link client) is left on /login to avoid a redirect loop
  // with the internal-route guard above.
  if (request.nextUrl.pathname === "/login" && user && isStaff(user.email)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
