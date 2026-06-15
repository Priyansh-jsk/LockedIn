'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    throw new Error('Unauthorized')
  }

  const headline = formData.get('headline') as string
  const bio = formData.get('bio') as string
  const location = formData.get('location') as string
  const website = formData.get('website') as string
  const githubUrl = formData.get('githubUrl') as string

  try {
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        headline: headline || null,
        bio: bio || null,
        location: location || null,
        website: website || null,
        githubUrl: githubUrl || null,
      }
    })
    
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/edit')
    if (user.user_metadata?.username) {
      revalidatePath(`/profile/${user.user_metadata.username}`)
    }
  } catch (err: any) {
    console.error('Update profile error:', err)
    throw new Error('Failed to update profile: ' + err.message)
  }
}

export async function addExperience(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    throw new Error('Unauthorized')
  }

  const company = formData.get('company') as string
  const role = formData.get('role') as string
  const startDateVal = formData.get('startDate') as string
  const endDateVal = formData.get('endDate') as string
  const description = formData.get('description') as string

  if (!company || !role || !startDateVal) {
    throw new Error('Company name, role, and start date are required.')
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      throw new Error('Profile not found.')
    }

    await prisma.experience.create({
      data: {
        profileId: profile.id,
        company,
        role,
        startDate: new Date(startDateVal),
        endDate: endDateVal ? new Date(endDateVal) : null,
        description: description || null,
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/edit')
    if (user.user_metadata?.username) {
      revalidatePath(`/profile/${user.user_metadata.username}`)
    }
  } catch (err: any) {
    throw new Error('Failed to add experience: ' + err.message)
  }
}

export async function deleteExperience(experienceId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    throw new Error('Unauthorized')
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      throw new Error('Profile not found.')
    }

    await prisma.experience.delete({
      where: {
        id: experienceId,
        profileId: profile.id
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/edit')
    if (user.user_metadata?.username) {
      revalidatePath(`/profile/${user.user_metadata.username}`)
    }
  } catch (err: any) {
    throw new Error('Failed to delete experience: ' + err.message)
  }
}

export async function addSkill(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    throw new Error('Unauthorized')
  }

  const skillName = formData.get('skillName') as string
  const cleanSkill = skillName ? skillName.trim() : ''
  if (!cleanSkill) {
    throw new Error('Skill name cannot be empty.')
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      throw new Error('Profile not found.')
    }

    const skill = await prisma.skill.upsert({
      where: { name: cleanSkill },
      update: {},
      create: { name: cleanSkill }
    })

    const existingLink = await prisma.userSkill.findUnique({
      where: {
        profileId_skillId: {
          profileId: profile.id,
          skillId: skill.id
        }
      }
    })

    if (!existingLink) {
      await prisma.userSkill.create({
        data: {
          profileId: profile.id,
          skillId: skill.id
        }
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/edit')
    if (user.user_metadata?.username) {
      revalidatePath(`/profile/${user.user_metadata.username}`)
    }
  } catch (err: any) {
    throw new Error('Failed to add skill: ' + err.message)
  }
}

export async function deleteSkill(skillId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    throw new Error('Unauthorized')
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      throw new Error('Profile not found.')
    }

    await prisma.userSkill.delete({
      where: {
        profileId_skillId: {
          profileId: profile.id,
          skillId: skillId
        }
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/edit')
    if (user.user_metadata?.username) {
      revalidatePath(`/profile/${user.user_metadata.username}`)
    }
  } catch (err: any) {
    throw new Error('Failed to delete skill: ' + err.message)
  }
}
