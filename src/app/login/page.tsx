'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/app/auth/actions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

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
            Welcome Back
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Sign in to access your secure professional feed.
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
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john@example.com"
                className="w-full px-4 h-11 bg-zinc-950/60 border border-zinc-800 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-zinc-500 hover:text-cyan-400 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 h-11 bg-zinc-950/60 border border-zinc-800 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-hidden transition-all text-sm"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-lg bg-linear-to-r from-emerald-400 to-cyan-400 text-black font-semibold text-sm flex items-center justify-center hover:from-emerald-300 hover:to-cyan-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/10 mt-6 active:scale-[0.98]"
            >
              {isPending ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-cyan-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
