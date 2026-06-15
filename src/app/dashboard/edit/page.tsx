import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import {
  updateProfile,
  addExperience,
  deleteExperience,
  addSkill,
  deleteSkill,
} from './actions'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      experiences: {
        orderBy: { startDate: 'desc' },
      },
      skills: {
        include: {
          skill: true,
        },
      },
    },
  })

  if (!profile) {
    redirect('/dashboard')
  }

  // Format dates for input fields (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              Edit Your Profile
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Customize your public professional identity on lockedin.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* 1. General Profile Info Form */}
        <section className="p-6 bg-zinc-950/60 rounded-xl border border-zinc-900 backdrop-blur-md space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200">General Information</h2>
          <form action={updateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Headline</label>
                <input
                  type="text"
                  name="headline"
                  defaultValue={profile.headline || ''}
                  placeholder="e.g. Software Engineer @ Open Source"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={profile.location || ''}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Biography</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={profile.bio || ''}
                placeholder="Share a short summary of your professional background, interests, and goals..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Website URL</label>
                <input
                  type="url"
                  name="website"
                  defaultValue={profile.website || ''}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">GitHub Profile URL</label>
                <input
                  type="url"
                  name="githubUrl"
                  defaultValue={profile.githubUrl || ''}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
            >
              Save Profile Info
            </button>
          </form>
        </section>

        {/* 2. Skills Section */}
        <section className="p-6 bg-zinc-950/60 rounded-xl border border-zinc-900 backdrop-blur-md space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200">Skills</h2>
          
          {/* Current Skills List */}
          <div className="flex flex-wrap gap-2">
            {profile.skills.length === 0 ? (
              <p className="text-sm text-zinc-500">No skills added yet. Add some below or import your resume.</p>
            ) : (
              profile.skills.map(({ skill }) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-300"
                >
                  <span>{skill.name}</span>
                  <form
                    action={async () => {
                      'use server'
                      await deleteSkill(skill.id)
                    }}
                  >
                    <button
                      type="submit"
                      className="text-zinc-500 hover:text-red-400 font-bold transition focus:outline-none"
                    >
                      ×
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>

          {/* Add Skill Form */}
          <form action={addSkill} className="flex gap-2 items-end max-w-md">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-zinc-400">Add Skill</label>
              <input
                type="text"
                name="skillName"
                placeholder="e.g. Next.js, Rust, Docker"
                required
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-zinc-900 hover:bg-zinc-850 border border-zinc-805 hover:border-zinc-700 text-emerald-400 rounded-lg transition h-[38px]"
            >
              Add
            </button>
          </form>
        </section>

        {/* 3. Experiences Section */}
        <section className="p-6 bg-zinc-950/60 rounded-xl border border-zinc-900 backdrop-blur-md space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200">Experience</h2>

          {/* Experience list */}
          <div className="space-y-4">
            {profile.experiences.length === 0 ? (
              <p className="text-sm text-zinc-500">No work experiences listed yet. Add one below.</p>
            ) : (
              profile.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-lg flex justify-between items-start"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-zinc-200">{exp.role}</h3>
                    <p className="text-sm text-emerald-400">{exp.company}</p>
                    <p className="text-xs text-zinc-500">
                      {formatDateForInput(exp.startDate)} —{' '}
                      {exp.endDate ? formatDateForInput(exp.endDate) : 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-zinc-400 mt-2 max-w-xl whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <form
                    action={async () => {
                      'use server'
                      await deleteExperience(exp.id)
                    }}
                  >
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:text-white bg-red-950/20 hover:bg-red-600/80 rounded border border-red-900/50 hover:border-red-600 transition"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>

          {/* Add Experience Form */}
          <div className="border-t border-zinc-900 pt-6 space-y-4">
            <h3 className="text-md font-semibold text-zinc-300">Add New Work Experience</h3>
            <form action={addExperience} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Pied Piper"
                    required
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Role / Position</label>
                  <input
                    type="text"
                    name="role"
                    placeholder="e.g. Lead Developer"
                    required
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">End Date (Leave blank if current)</label>
                  <input
                    type="date"
                    name="endDate"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Job Description</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe your achievements, responsibilities, and technologies used..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-200 focus:outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
              >
                Add Experience
              </button>
            </form>
          </div>
        </section>

      </div>
    </main>
  )
}
