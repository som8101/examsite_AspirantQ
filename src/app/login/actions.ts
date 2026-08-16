'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const loginId = formData.get('loginId') as string
  const password = formData.get('password') as string

  if (!loginId || !password) {
    redirect('/login?error=Missing credentials')
  }

  // 1. Look up email using the RPC function
  const { data: email, error: rpcError } = await supabase.rpc('get_email_by_login_id', {
    p_login_id: loginId
  })

  if (rpcError || !email) {
    redirect('/login?error=Invalid User ID or password')
  }

  // 2. Authenticate with Supabase
  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  
  // Redirect based on role
  if (authData.user?.user_metadata?.role === 'admin') {
     redirect('/admin/dashboard')
  } else {
     redirect('/student/dashboard')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const role = formData.get('role') as string || 'student'
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const loginId = formData.get('loginId') as string

  if (!email || !password || !fullName || !loginId) {
    redirect('/login?error=Missing fields')
  }

  const { error, data: authData } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        login_id: loginId
      }
    }
  })

  if (error) {
    if (error.message.includes('unique constraint') || error.message.includes('login_id')) {
        redirect(`/login?error=${encodeURIComponent('User ID is already taken. Please choose another.')}`)
    }
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  
  if (role === 'admin') {
      redirect('/admin/dashboard')
  }
  redirect('/student/dashboard')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    redirect('/login?error=Email is required')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Password reset email sent!')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
