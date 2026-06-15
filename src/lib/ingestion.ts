export interface IngestedExperience {
  company: string
  role: string
  startDate: Date
  endDate: Date | null
  description: string | null
}

export interface IngestedProfile {
  headline: string | null
  bio: string | null
  location: string | null
  website: string | null
  experiences: IngestedExperience[]
  skills: string[]
}

/**
 * Standard CSV Parser supporting double-quotes and escaped quotes.
 */
export function parseCSV(text: string): string[][] {
  const result: string[][] = []
  let row: string[] = []
  let insideQuote = false
  let currentVal = ''

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"'
        i++ // Skip next double quote
      } else {
        insideQuote = !insideQuote
      }
    } else if (char === ',' && !insideQuote) {
      row.push(currentVal.trim())
      currentVal = ''
    } else if ((char === '\n' || char === '\r') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++ // Skip LF if CRLF
      }
      row.push(currentVal.trim())
      result.push(row)
      row = []
      currentVal = ''
    } else {
      currentVal += char
    }
  }
  if (currentVal || row.length > 0) {
    row.push(currentVal.trim())
    result.push(row)
  }
  return result.filter(r => r.length > 0 && r.some(cell => cell !== ''))
}

/**
 * Parse standard JSON Resume schema.
 */
export function parseJSONResume(jsonContent: string): IngestedProfile {
  const raw = JSON.parse(jsonContent)
  
  const basics = raw.basics || {}
  const location = basics.location ? [basics.location.city, basics.location.region, basics.location.countryCode].filter(Boolean).join(', ') : null

  const experiences: IngestedExperience[] = (raw.work || []).map((w: any) => {
    return {
      company: w.company || w.name || 'Unknown Company',
      role: w.position || 'Employee',
      startDate: w.startDate ? new Date(w.startDate) : new Date(),
      endDate: w.endDate ? new Date(w.endDate) : null,
      description: w.summary || w.description || null
    }
  })

  const skills: string[] = (raw.skills || []).map((s: any) => s.name).filter(Boolean)

  return {
    headline: basics.label || null,
    bio: basics.summary || null,
    location: location || null,
    website: basics.url || null,
    experiences,
    skills
  }
}

/**
 * Parse date strings commonly exported from LinkedIn.
 * Handles: "Jan 2018", "2018-01", "01/2018", "Present"
 */
function parseLinkedInDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr.toLowerCase().trim() === 'present' || dateStr.trim() === '') {
    return null
  }
  
  const parsed = Date.parse(dateStr)
  if (!isNaN(parsed)) {
    return new Date(parsed)
  }

  // Fallback for custom formats like "Jan 2018" or "01/2018"
  const clean = dateStr.trim()
  const parts = clean.split(/[\s/-]+/)
  if (parts.length === 2) {
    // Check if month name or number
    const year = parseInt(parts[1])
    if (!isNaN(year) && year > 1900 && year < 2100) {
      return new Date(year, 0, 1) // default to Jan 1st of that year
    }
  }
  
  return new Date()
}

/**
 * Parse individual LinkedIn CSV contents.
 */
export function parseLinkedInCSV(
  fileType: 'profile' | 'positions' | 'skills',
  csvContent: string
): Partial<IngestedProfile> {
  const rows = parseCSV(csvContent)
  if (rows.length < 2) {
    return {}
  }

  const headers = rows[0].map(h => h.toLowerCase().replace(/\s/g, ''))
  const dataRows = rows.slice(1)

  if (fileType === 'profile') {
    // Grab first data row
    const row = dataRows[0]
    const headlineIdx = headers.indexOf('headline')
    const summaryIdx = headers.indexOf('summary')
    const locationIdx = headers.indexOf('geolocation') || headers.indexOf('address') || headers.indexOf('zipcode')
    const websiteIdx = headers.indexOf('websites') || headers.indexOf('website')
    
    return {
      headline: headlineIdx !== -1 ? row[headlineIdx] || null : null,
      bio: summaryIdx !== -1 ? row[summaryIdx] || null : null,
      location: locationIdx !== -1 ? row[locationIdx] || null : null,
      website: websiteIdx !== -1 ? row[websiteIdx] || null : null
    }
  }

  if (fileType === 'positions') {
    const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('employer'))
    const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('role'))
    const descIdx = headers.findIndex(h => h.includes('description') || h.includes('summary'))
    const startIdx = headers.findIndex(h => h.includes('start'))
    const endIdx = headers.findIndex(h => h.includes('end'))

    const experiences: IngestedExperience[] = dataRows.map(row => {
      const company = companyIdx !== -1 ? row[companyIdx] : 'Unknown Company'
      const role = titleIdx !== -1 ? row[titleIdx] : 'Employee'
      const desc = descIdx !== -1 ? row[descIdx] : null
      const startVal = startIdx !== -1 ? row[startIdx] : ''
      const endVal = endIdx !== -1 ? row[endIdx] : ''

      const startDate = parseLinkedInDate(startVal) || new Date()
      const endDate = parseLinkedInDate(endVal)

      return {
        company: company || 'Unknown Company',
        role: role || 'Employee',
        startDate,
        endDate,
        description: desc || null
      }
    })

    return { experiences }
  }

  if (fileType === 'skills') {
    const nameIdx = headers.findIndex(h => h === 'name' || h === 'skill' || h.includes('name'))
    const skills: string[] = dataRows.map(row => {
      const val = nameIdx !== -1 ? row[nameIdx] : row[0]
      return val ? val.trim() : ''
    }).filter(Boolean)

    return { skills }
  }

  return {}
}
