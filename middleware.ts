// Next.js middleware for route protection and role-based redirects
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession, canAccessAdmin, canAccessOperator } from './src/middleware/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getUserFromSession(request);

  // Protected routes that require authentication
  const adminRoutes = ['/admin'];
  const operatorRoutes = ['/operator'];
  const protectedRoutes = [...adminRoutes, ...operatorRoutes];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isOperatorRoute = operatorRoutes.some(route => pathname.startsWith(route));

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/loginpage', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (user && isProtectedRoute) {
    // Admin route access control
    if (isAdminRoute && !canAccessAdmin(user)) {
      // Redirect unauthorized users to their appropriate dashboard or access denied
      if (user.role === 'operator') {
        return NextResponse.redirect(new URL('/operator', request.url));
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Operator route access control
    if (isOperatorRoute && !canAccessOperator(user)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Redirect authenticated users from root to their appropriate dashboard
  if (pathname === '/' && user) {
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (user.role === 'operator') {
      return NextResponse.redirect(new URL('/operator', request.url));
    }
  }

  return NextResponse.next();
}

// // Configure which routes the middleware should run on
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public folder files
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
//   ],
// };