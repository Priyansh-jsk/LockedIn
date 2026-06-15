'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUpAction } from '@/app/auth/actions'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, null)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Back button */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-10 h-10 rounded-lg bg-linear-to-br from-emerald-400 to-cyan-500 items-center justify-center font-bold text-black text-2xl shadow-lg shadow-emerald-500/20 mb-4">
            L
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Join LockedIn
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Create your federated and verified professional identity.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-md shadow-xl shadow-black/40">
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-lg flex gap-2 items-center">
                <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{state.error}</span>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full px-4 h-11 bg-zinc-950/60 border border-zinc-800 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="johndoe"
                  className="w-full pl-8 pr-4 h-11 bg-zinc-950/60 border border-zinc-800 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john@example.com"
                className="w-full px-4 h-11 bg-zinc-950/60 border border-zinc-800 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 h-11 bg-zinc-950/60 border border-zinc-800 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden transition-all text-sm"
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-lg bg-linear-to-r from-emerald-400 to-cyan-400 text-black font-semibold text-sm flex items-center justify-center hover:from-emerald-300 hover:to-cyan-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/10 mt-6 active:scale-[0.98]"
            >
              {isPending ? 'Generating Cryptographic Keys...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
