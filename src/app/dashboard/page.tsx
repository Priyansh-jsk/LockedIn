import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { signOutAction } from '@/app/auth/actions'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Get authenticated user from Supabase
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()

  if (error || !supabaseUser) {
    redirect('/login')
  }

  // 2. Fetch User and Profile details from Prisma DB
  const user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    include: { profile: true }
  })

  if (!user) {
    // If user is in Supabase but not in Prisma, redirect to login or clear auth.
    // For now we log out to sync states
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-6 font-sans">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Profile Synchronization Issue</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Your auth session is valid, but we couldn't find your profile in our local database.
          </p>
          <form action={signOutAction}>
            <button className="px-6 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-md font-semibold text-sm transition-all duration-200">
              Sign Out & Try Again
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/40 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-black text-lg shadow-md">
              L
            </div>
            <span className="font-extrabold tracking-tight bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              lockedin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-zinc-500">@{user.username}</p>
            </div>
            <form action={signOutAction}>
              <button
                id="dashboard-logout"
                type="submit"
                className="px-4 h-9 border border-zinc-850 hover:border-zinc-750 hover:bg-zinc-900 rounded-md text-sm font-medium text-zinc-400 hover:text-white transition-all duration-200"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full grid md:grid-cols-3 gap-8">
        {/* Left Column: Brief Profile summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 font-extrabold text-2xl shadow-inner uppercase">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">{user.name}</h2>
                <p className="text-zinc-500 text-sm">@{user.username}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-800/40 text-zinc-400 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Local Node
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-900 text-sm">
              <div>
                <span className="block text-zinc-500 font-semibold text-xs uppercase tracking-wider mb-1">Headline</span>
                <p className="text-zinc-350">{user.profile?.headline || 'No headline set'}</p>
              </div>
              <div>
                <span className="block text-zinc-500 font-semibold text-xs uppercase tracking-wider mb-1">Biography</span>
                <p className="text-zinc-450 leading-relaxed text-xs">{user.profile?.bio || 'No bio set'}</p>
              </div>
              <div>
                <span className="block text-zinc-500 font-semibold text-xs uppercase tracking-wider mb-1">Member Since</span>
                <p className="text-zinc-400">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security Keys and verification overview */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-md">
            <h3 className="font-extrabold text-lg mb-2 bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Cryptographic Credentials Activated
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              During registration, a 2048-bit RSA keypair was securely generated. Your public key is broadcasted to federated nodes via Webfinger so they can cryptographically verify posts and interactions signed by your private key.
            </p>

            <div className="space-y-4">
              <div>
                <span className="block text-zinc-500 font-semibold text-xs uppercase tracking-wider mb-2">
                  Public Signature Key (PEM)
                </span>
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-40 leading-normal scrollbar-thin select-all">
                  <pre>{user.publicKey}</pre>
                </div>
              </div>

              <div>
                <span className="block text-zinc-500 font-semibold text-xs uppercase tracking-wider mb-2">
                  Private Signature Key (Encrypted in database)
                </span>
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 font-mono text-[10px] text-zinc-550 overflow-x-auto max-h-24 leading-normal scrollbar-thin select-none">
                  <pre>{user.privateKey.substring(0, 150)}...</pre>
                </div>
                <span className="text-[10px] text-zinc-500 mt-2 block">
                  🛡️ Symmetrically encrypted with AES-256-CBC using your passphrase. Decrypted memory-only when signing federation activities.
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <h3 className="font-bold text-base mb-2">What's Next?</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Your LockedIn profile is now set up and secured with ActivityPub cryptography. In the next sprint, we'll implement:
            </p>
            <ul className="space-y-2 text-sm text-zinc-400 list-disc list-inside">
              <li>Ingesting LinkedIn data archives / JSON Resume format</li>
              <li>Setting up weighted feeds using customizable sliders</li>
              <li>Verifying institutional domains (e.g. university/company emails)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
