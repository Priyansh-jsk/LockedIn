'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { generateUserKeys } from '@/lib/keys'
import { redirect } from 'next/navigation'

export async function signUpAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const username = formData.get('username') as string

  if (!email || !password || !name || !username) {
    return { error: 'All fields are required.' }
  }

  // Sanitize username (lowercase, alphanumeric + underscores/dashes)
  const sanitizedUsername = username.trim().toLowerCase()
  if (!/^[a-z0-9_-]+$/.test(sanitizedUsername)) {
    return { error: 'Username must contain only alphanumeric characters, underscores, or dashes.' }
  }

  // 1. Check if username already exists in database
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: sanitizedUsername }
    })
    if (existingUser) {
      return { error: 'Username is already taken.' }
    }
  } catch (error) {
    console.error('Prisma lookup error:', error)
    return { error: 'Failed to verify username availability.' }
  }

  // 2. Sign up user in Supabase
  const supabase = await createClient()
  const { data, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        username: sanitizedUsername,
      }
    }
  })

  if (signupError) {
    return { error: signupError.message }
  }

  const supabaseUser = data.user
  if (!supabaseUser) {
    return { error: 'Could not create user session. Please try again.' }
  }

  // 3. Generate RSA-256 keys locally
  let keys;
  try {
    keys = generateUserKeys(password)
  } catch (keyError) {
    console.error('Key generation error:', keyError)
    return { error: 'Failed to generate cryptographic credentials.' }
  }

  // 4. Create Prisma User and Profile records
  try {
    await prisma.user.create({
      data: {
        id: supabaseUser.id, // Match the Supabase ID
        email,
        name,
        username: sanitizedUsername,
        passwordHash: 'SUPABASE_AUTH_MANAGED', // Passwords managed by Supabase
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        profile: {
          create: {
            headline: 'New Member at LockedIn',
            bio: 'Hey! I just joined LockedIn, the trust-verified professional network.',
          }
        }
      }
    })
  } catch (dbError: any) {
    console.error('Prisma user creation error:', dbError)
    // Clean up Supabase auth if prisma fails (optional but good practice)
    // For simplicity, we report database error
    return { error: 'Failed to initialize profile. Please contact support.' }
  }

  redirect('/dashboard')
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
