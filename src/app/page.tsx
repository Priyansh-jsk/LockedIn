import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'LockedIn - Federated & Trust-Verified Professional Network',
  description: 'An open-source, federated alternative to LinkedIn. Own your professional data, cryptographically verify credentials, and customize feed algorithms.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-emerald-500/20">
              L
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              lockedin
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              id="nav-login"
              href="/login"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              id="nav-signup"
              href="/signup"
              className="text-sm font-semibold text-black bg-linear-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 px-4 h-9 rounded-md flex items-center justify-center transition-all duration-200 shadow-md shadow-emerald-500/10 active:scale-[0.98]"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-xs font-semibold tracking-wide mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Federated & Cryptographically Verified
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
            The professional network <br />
            <span className="bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              owned by you
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            An open-source, federated alternative to LinkedIn. Control your feed algorithms, cryptographically verify your credentials, and host your own professional node.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              id="hero-signup"
              href="/signup"
              className="w-full sm:w-auto px-8 h-12 rounded-lg bg-linear-to-r from-emerald-400 to-cyan-400 text-black font-semibold flex items-center justify-center shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all duration-200 active:scale-[0.98]"
            >
              Create Your Free Profile
            </Link>
            <Link
              id="hero-demo"
              href="/login"
              className="w-full sm:w-auto px-8 h-12 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-300 font-semibold flex items-center justify-center hover:bg-zinc-800/80 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="border-t border-zinc-900 bg-zinc-950/40 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16 tracking-tight">
              Designed for transparency, trust, and autonomy
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-xs hover:border-emerald-500/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-3">Federated Identity</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Decentralized profiles connected via ActivityPub. Move your account to any instance anytime, without losing connections.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-xs hover:border-cyan-500/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-3">Trust Verification</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Cryptographically verify employment, education, or DNS records. Say goodbye to bots, corporate spam, and identity fraud.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-xs hover:border-teal-500/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6 text-teal-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-3">Custom Algorithms</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  You control what you see. Adjust weights using simple UI sliders (Recency vs. Skills vs. Verification status) to curate your feed.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-xs hover:border-purple-500/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-3">Frictionless Import</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Migrate instantly. Upload a JSON Resume or LinkedIn archive file to populate your profile and experiences in a single click.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-12 text-center text-zinc-500 text-sm">
        <p className="mb-4">&copy; {new Date().getFullYear()} lockedin. Built for open-source professional collaboration.</p>
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  )
}
