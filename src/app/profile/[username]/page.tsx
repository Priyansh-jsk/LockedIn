import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

interface PublicProfileProps {
  params: Promise<{
    username: string
  }>
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const { username } = await params

  // 1. Fetch user and nested profile data
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: {
        include: {
          experiences: {
            orderBy: { startDate: 'desc' },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          verifications: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const profile = user.profile
  const experiences = profile?.experiences || []
  const skills = profile?.skills || []

  // Check if current visitor is logged in, to show "Dashboard" shortcut
  let isLoggedUser = false
  try {
    const supabase = await createClient()
    const { data: { user: loggedInUser } } = await supabase.auth.getUser()
    if (loggedInUser && loggedInUser.id === user.id) {
      isLoggedUser = true
    }
  } catch (err) {
    // Visitor is not logged in or auth failed
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation & Status bar */}
        <div className="flex justify-between items-center text-xs text-zinc-500 border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Node: Local Instance</span>
          </div>
          {isLoggedUser ? (
            <Link
              href="/dashboard"
              className="text-emerald-400 hover:text-emerald-350 font-semibold transition"
            >
              Go to Your Dashboard →
            </Link>
          ) : (
            <Link
              href="/"
              className="text-zinc-400 hover:text-white transition"
            >
              lockedin Professional Network
            </Link>
          )}
        </div>

        {/* 1. Header Card */}
        <section className="relative p-8 bg-zinc-950/40 rounded-3xl border border-zinc-900 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/10 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-350 font-extrabold text-3xl shadow-lg uppercase select-none">
              {user.name.charAt(0)}
            </div>

            {/* Core Info */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">{user.name}</h1>
                <span className="text-zinc-550 text-sm font-medium">@{user.username}</span>
                {profile?.verifications && profile.verifications.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800 text-[10px] text-emerald-400 font-bold">
                    ✓ Verified Domain
                  </span>
                )}
              </div>
              <p className="text-zinc-300 text-sm font-medium">{profile?.headline || 'Member at lockedin'}</p>
              
              {/* Meta links (Location, Web, Github) */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs text-zinc-500">
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    📍 {profile.location}
                  </span>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-zinc-350 transition"
                  >
                    🔗 Website
                  </a>
                )}
                {profile?.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-zinc-350 transition"
                  >
                    💻 GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Biography/Summary */}
        {profile?.bio && (
          <section className="p-8 bg-zinc-950/40 rounded-3xl border border-zinc-900 space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-zinc-500 font-bold">About</h2>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </section>
        )}

        {/* 3. Skills */}
        {skills.length > 0 && (
          <section className="p-8 bg-zinc-950/40 rounded-3xl border border-zinc-900 space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-zinc-500 font-bold">Skills & expertise</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(({ skill }) => (
                <span
                  key={skill.id}
                  className="px-3.5 py-1 bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-zinc-300 rounded-lg text-xs transition select-none"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 4. Experience Timeline */}
        {experiences.length > 0 && (
          <section className="p-8 bg-zinc-950/40 rounded-3xl border border-zinc-900 space-y-6">
            <h2 className="text-sm uppercase tracking-wider text-zinc-500 font-bold">Experience</h2>
            <div className="space-y-6 relative border-l border-zinc-850 pl-6 ml-3">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative space-y-2 group">
                  {/* Timeline bullet indicator */}
                  <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-800 border-2 border-black group-hover:bg-emerald-500 transition-all duration-300" />
                  
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">{exp.role}</h3>
                    <p className="text-xs text-zinc-400 font-medium">{exp.company}</p>
                    <p className="text-[10px] text-zinc-500 pt-0.5">
                      {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-xl whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Cryptographic Verification Key Card */}
        <section className="p-6 bg-zinc-950/20 rounded-3xl border border-zinc-900 text-center space-y-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Federated Security Signature</p>
          <div className="max-w-md mx-auto">
            <p className="text-xs text-zinc-400 leading-relaxed">
              This profile is cryptographically verified by the host instance. You can verify signed ActivityPub payloads using their public credentials key:
            </p>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 max-w-lg mx-auto font-mono text-[9px] text-zinc-650 overflow-x-auto text-left leading-normal scrollbar-none select-all select-none">
            <pre>{user.publicKey}</pre>
          </div>
        </section>

      </div>
    </main>
  )
}
