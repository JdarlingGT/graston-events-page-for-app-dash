import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the user's role from the session or token
  // For demo purposes, we'll use a header. In production, this would come from your auth system
  const userRole = request.headers.get('x-user-role') || 'guest';
  const _userId = request.headers.get('x-user-id');

  // Handle instructor-specific routes
  if (request.nextUrl.pathname.startsWith('/dashboard/instructors')) {
    // If user is an instructor, redirect them to their personal dashboard
    if (userRole === 'instructor') {
      // Only redirect if they're trying to access the main instructors list
      if (request.nextUrl.pathname === '/dashboard/instructors') {
        return NextResponse.redirect(new URL('/dashboard/instructors/me', request.url));
      }
    } else if (userRole !== 'admin') {
      // If user is not an admin or instructor, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Handle instructor workspace routes
  if (request.nextUrl.pathname.startsWith('/dashboard/trainings')) {
    // Only allow instructors and admins to access training workspaces
    if (!['admin', 'instructor'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/instructors/:path*',
    '/dashboard/trainings/:path*',
  ],
};