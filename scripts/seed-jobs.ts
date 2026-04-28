/**
 * Seed script: Import research CSV data into D1
 * Usage: npx tsx scripts/seed-jobs.ts
 * 
 * This reads ../EduConnect Research/china_schools_all_jobs.csv
 * and inserts schools + jobs into the local D1 database.
 */

import fs from 'fs'
import path from 'path'

interface CsvJob {
  School: string
  Position: string
  Location: string
  Type: string
  'Direct Email': string
  'Application Link': string
  Subject?: string
  Salary?: string
}

function parseCsv(text: string): CsvJob[] {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^\uFEFF/, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const obj: any = {}
    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim() || ''
    })
    return obj as CsvJob
  })
}

async function main() {
  const csvPath = path.resolve(__dirname, '../../EduConnect Research/china_schools_all_jobs.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath)
    process.exit(1)
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCsv(csvText)

  console.log(`Parsed ${rows.length} jobs from CSV`)
  console.log('Sample row:', rows[0])
  console.log('\nTo seed the database, adapt this script to use the D1 HTTP API,')
  console.log('or generate INSERT statements and run via wrangler d1 execute.')
}

main().catch(console.error)
