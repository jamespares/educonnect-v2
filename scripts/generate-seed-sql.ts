/**
 * Generate seed.sql from research CSVs
 * Usage: npx tsx scripts/generate-seed-sql.ts
 * Then:  npx wrangler d1 execute educonnect-db --local --file=./seed.sql
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

interface CsvJob {
  school_name: string
  job_title: string
  location: string
  job_type: string
  subject: string
  salary_range: string
  requirements: string
  start_date: string
  email: string
  contact_person: string
  application_link: string
  date_posted: string
  source_platform: string
  school_chain: string
  job_description: string
  benefits: string
  source_file: string
}

function parseCsv(text: string): CsvJob[] {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^\uFEFF/, ''))
  return lines.slice(1).map((line, idx) => {
    // Handle quoted fields that contain commas
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const obj: any = {}
    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim().replace(/^"|"$/g, '') || ''
    })
    return obj as CsvJob
  })
}

function esc(str: string): string {
  return str.replace(/'/g, "''").replace(/\x00/g, '').slice(0, 2000)
}

function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const csvPath = path.resolve(__dirname, '../../EduConnect Research/china_schools_all_jobs.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath)
    process.exit(1)
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCsv(csvText)
  console.error(`Parsed ${rows.length} jobs`)

  const sqlLines: string[] = []
  sqlLines.push("-- EduConnect v2 Seed Data")
  sqlLines.push("-- Generated from china_schools_all_jobs.csv")
  sqlLines.push("")

  // Create a system user for seeded jobs
  sqlLines.push("-- System user for research data")
  sqlLines.push("INSERT OR IGNORE INTO users (id, email, password_hash, role, created_at) VALUES (1, 'system@educonnect.local', 'system', 'admin', unixepoch());")
  sqlLines.push("")

  // Create a generic school profile for research data
  sqlLines.push("-- Generic school profile for research data")
  sqlLines.push("INSERT OR IGNORE INTO school_profiles (id, user_id, name, city, description, is_active, updated_at) VALUES (1, 1, 'EduConnect Research Network', 'China', 'Aggregated listings from verified sources', 1, unixepoch());")
  sqlLines.push("")

  sqlLines.push("-- Jobs from research data")
  sqlLines.push("INSERT INTO jobs (school_id, title, company, location, city, salary, experience_required, description, requirements, benefits, subjects, is_active, created_at) VALUES")

  const valueLines: string[] = []
  let skipped = 0

  for (const row of rows) {
    if (!row.job_title || !row.school_name) {
      skipped++
      continue
    }

    const city = row.location.split(',')[0].split('(')[0].trim()
    const salary = row.salary_range || ''
    const subjects = row.subject || ''
    const description = row.job_description || `${row.job_title} at ${row.school_name}`
    const requirements = row.requirements || ''
    const benefits = row.benefits || ''

    valueLines.push(
      `  (1, '${esc(row.job_title)}', '${esc(row.school_name)}', '${esc(row.location)}', '${esc(city)}', '${esc(salary)}', '', '${esc(description)}', '${esc(requirements)}', '${esc(benefits)}', '${esc(subjects)}', 1, unixepoch())`
    )
  }

  sqlLines.push(valueLines.join(',\n') + ';')
  sqlLines.push("")
  sqlLines.push(`-- Total: ${valueLines.length} jobs inserted (${skipped} skipped)`)

  const outputPath = path.resolve(__dirname, '../seed.sql')
  fs.writeFileSync(outputPath, sqlLines.join('\n'))
  console.error(`\nWrote seed.sql with ${valueLines.length} jobs to ${outputPath}`)
  console.error('Run it with:')
  console.error('  npx wrangler d1 execute educonnect-db --local --file=./seed.sql')
}

main()
