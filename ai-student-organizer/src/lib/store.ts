import fs from 'fs'
import path from 'path'
import { CategorizedEmail } from './types'

const DATA_DIR = path.join(process.cwd(), '.data')

const getFilePath = (userId: string) =>
  path.join(DATA_DIR, `${userId.replace(/[^a-z0-9]/gi, '_')}.json`)

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function getEmails(userId: string): CategorizedEmail[] {
  try {
    ensureDir()
    const file = getFilePath(userId)
    if (!fs.existsSync(file)) return []
    return JSON.parse(fs.readFileSync(file, 'utf-8')).emails || []
  } catch {
    return []
  }
}

export function setEmails(userId: string, emails: CategorizedEmail[]): void {
  ensureDir()
  fs.writeFileSync(
    getFilePath(userId),
    JSON.stringify({ emails, lastFetched: Date.now() })
  )
}

export function getLastFetched(userId: string): number | null {
  try {
    const file = getFilePath(userId)
    if (!fs.existsSync(file)) return null
    return JSON.parse(fs.readFileSync(file, 'utf-8')).lastFetched || null
  } catch {
    return null
  }
}

export function clearEmails(userId: string): void {
  try {
    fs.unlinkSync(getFilePath(userId))
  } catch {}
}