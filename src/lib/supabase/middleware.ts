import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;
  
  if (!user) {
    if (pathname.startsWith('/student') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // If user is logged in and trying to access root or login, redirect to dashboard based on role
    if (pathname === '/login' || pathname === '/') {
       const role = user.user_metadata?.role || 'student';
       return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    
    // Basic route protection based on role metadata
    const role = user.user_metadata?.role || 'student';
    if (pathname.startsWith('/admin') && role !== 'admin') {
       return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
    if (pathname.startsWith('/student') && role === 'admin') {
       return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return supabaseResponse
}
