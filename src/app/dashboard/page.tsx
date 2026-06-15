import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { signOutAction } from '@/app/auth/actions'
import ImportProfile from '@/components/ImportProfile'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Get authenticated user from Supabase
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()

  if (error || !supabaseUser) {
    redirect('/login')
  }

  // 2. Fetch User and Profile details (with experiences and skills) from Prisma DB
  const user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    include: {
      profile: {
        include: {
          experiences: {
            orderBy: { startDate: 'desc' }
          },
          skills: {
            include: {
              skill: true
            }
          }
        }
      }
    }
  })

  if (!user) {
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
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-black text-lg shadow-md">
              L
            </div>
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
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
        
        {/* Left Column: Brief Profile summary & Preview */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Main User Card */}
          <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 font-extrabold text-2xl shadow-inner uppercase">
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

            <div className="space-y-4 pt-4 border-t border-zinc-900 text-sm mb-6">
              <div>
                <span className="block text-zinc-550 font-bold text-[10px] uppercase tracking-wider mb-1">Headline</span>
                <p className="text-zinc-300 text-xs">{user.profile?.headline || 'No headline set'}</p>
              </div>
              <div>
                <span className="block text-zinc-550 font-bold text-[10px] uppercase tracking-wider mb-1">Biography</span>
                <p className="text-zinc-400 leading-relaxed text-xs">{user.profile?.bio || 'No bio set'}</p>
              </div>
              <div>
                <span className="block text-zinc-550 font-bold text-[10px] uppercase tracking-wider mb-1">Member Since</span>
                <p className="text-zinc-450 text-xs">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex flex-col gap-2">
              <Link
                href="/dashboard/edit"
                className="w-full text-center py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
              >
                Edit Profile Manually
              </Link>
              <Link
                href={`/profile/${user.username}`}
                className="w-full text-center py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition"
              >
                View Public Profile
              </Link>
            </div>
          </div>

          {/* Experience & Skills Preview */}
          <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-md space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500">Career Preview</h3>
            
            <div className="space-y-4">
              <div>
                <span className="block text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-2">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {!user.profile?.skills || user.profile.skills.length === 0 ? (
                    <span className="text-xs text-zinc-600">No skills added yet</span>
                  ) : (
                    user.profile.skills.map(({ skill }) => (
                      <span key={skill.id} className="px-2.5 py-0.5 bg-zinc-950 border border-zinc-900 text-zinc-400 rounded text-[10px]">
                        {skill.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <span className="block text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-2">Recent Experience</span>
                <div className="space-y-2">
                  {!user.profile?.experiences || user.profile.experiences.length === 0 ? (
                    <span className="text-xs text-zinc-650">No experience listed</span>
                  ) : (
                    user.profile.experiences.slice(0, 3).map((exp) => (
                      <div key={exp.id} className="text-xs border-l border-zinc-800 pl-3 py-1 space-y-0.5">
                        <p className="font-semibold text-zinc-300">{exp.role}</p>
                        <p className="text-zinc-500 text-[10px]">{exp.company}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Key credentials & File Importer */}
        <div className="md:col-span-2 space-y-6">
          
          {/* File Importer */}
          <ImportProfile />

          {/* Credentials Card */}
          <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-md">
            <h3 className="font-extrabold text-lg mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Cryptographic Credentials Activated
            </h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
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
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 font-mono text-[10px] text-zinc-600 overflow-x-auto max-h-24 leading-normal scrollbar-thin select-none">
                  <pre>{user.privateKey.substring(0, 150)}...</pre>
                </div>
                <span className="text-[10px] text-zinc-500 mt-2 block">
                  🛡️ Symmetrically encrypted with AES-256-CBC using your passphrase. Decrypted memory-only when signing federation activities.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
