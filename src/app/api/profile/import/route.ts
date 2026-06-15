import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { parseJSONResume, parseLinkedInCSV, IngestedProfile } from '@/lib/ingestion'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user via Supabase
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Read multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const importType = formData.get('importType') as string | null // 'json' | 'linkedin-profile' | 'linkedin-positions' | 'linkedin-skills'

    if (!file || !importType) {
      return NextResponse.json({ error: 'Missing file or importType' }, { status: 400 })
    }

    const fileContent = await file.text()
    let parsedData: Partial<IngestedProfile> = {}

    // 3. Invoke parser based on import type
    if (importType === 'json') {
      try {
        parsedData = parseJSONResume(fileContent)
      } catch (jsonErr) {
        console.error('JSON resume parsing error:', jsonErr)
        return NextResponse.json({ error: 'Invalid JSON Resume format' }, { status: 400 })
      }
    } else if (
      importType === 'linkedin-profile' ||
      importType === 'linkedin-positions' ||
      importType === 'linkedin-skills'
    ) {
      try {
        const typeMapping: Record<string, 'profile' | 'positions' | 'skills'> = {
          'linkedin-profile': 'profile',
          'linkedin-positions': 'positions',
          'linkedin-skills': 'skills'
        }
        parsedData = parseLinkedInCSV(typeMapping[importType], fileContent)
      } catch (csvErr) {
        console.error('LinkedIn CSV parsing error:', csvErr)
        return NextResponse.json({ error: 'Invalid LinkedIn CSV format' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Unsupported importType' }, { status: 400 })
    }

    // 4. Retrieve Profile ID from database
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found in database' }, { status: 404 })
    }

    // 5. Update database via Prisma Transaction
    await prisma.$transaction(async (tx) => {
      // Update core profile fields
      const updatePayload: any = {}
      if (parsedData.headline) updatePayload.headline = parsedData.headline
      if (parsedData.bio) updatePayload.bio = parsedData.bio
      if (parsedData.location) updatePayload.location = parsedData.location
      if (parsedData.website) updatePayload.website = parsedData.website
      
      // Store backup of imported raw data
      updatePayload.jsonResumeData = {
        importType,
        importedAt: new Date().toISOString(),
        rawContent: fileContent.slice(0, 100000) // limit size to prevent DB bloat
      }

      if (Object.keys(updatePayload).length > 0) {
        await tx.profile.update({
          where: { id: profile.id },
          data: updatePayload
        })
      }

      // Sync Experiences (if provided in import)
      if (parsedData.experiences && parsedData.experiences.length > 0) {
        // Clear previous manual experiences
        await tx.experience.deleteMany({
          where: { profileId: profile.id }
        })

        // Insert new ones
        await tx.experience.createMany({
          data: parsedData.experiences.map(e => ({
            profileId: profile.id,
            company: e.company,
            role: e.role,
            startDate: e.startDate,
            endDate: e.endDate,
            description: e.description
          }))
        })
      }

      // Sync Skills (if provided in import)
      if (parsedData.skills && parsedData.skills.length > 0) {
        // Clear previous skills linked to this profile
        await tx.userSkill.deleteMany({
          where: { profileId: profile.id }
        })

        for (const skillName of parsedData.skills) {
          const cleanName = skillName.trim()
          if (!cleanName) continue

          // Upsert global Skill record
          const skill = await tx.skill.upsert({
            where: { name: cleanName },
            update: {},
            create: { name: cleanName }
          })

          // Connect Profile to Skill
          await tx.userSkill.create({
            data: {
              profileId: profile.id,
              skillId: skill.id
            }
          })
        }
      }
    })

    return NextResponse.json({ success: true, message: 'Data imported successfully' })

  } catch (err: any) {
    console.error('Import API general error:', err)
    return NextResponse.json({ error: 'Internal server error: ' + err.message }, { status: 500 })
  }
}
