import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DATABASE_URL || './data/sempreinviaggio.db'
const dbDir = path.dirname(path.resolve(DB_PATH))
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

const sqlite = new Database(path.resolve(DB_PATH))
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL || 'micheleromano.priv@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123!'
  const now = Math.floor(Date.now() / 1000)

  // Check if admin exists
  const existing = sqlite.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 12)
    sqlite.prepare('INSERT INTO users (email, password, name, created_at) VALUES (?, ?, ?, ?)').run(
      adminEmail, hash, 'Michele Romano', now
    )
    console.log(`Admin user created: ${adminEmail}`)
    console.log(`Password: ${adminPassword} — CHANGE THIS IMMEDIATELY`)
  } else {
    console.log('Admin user already exists.')
  }

  // Default settings
  const defaultSettings = [
    ['site_name', 'Sempre in Viaggio'],
    ['site_description', 'Il blog di viaggio di Michele Romano — destinazioni, itinerari e consigli di viaggio.'],
    ['site_email', adminEmail],
    ['ga4_id', ''],
    ['default_og_image', ''],
    ['google_verification', ''],
    ['smtp_host', ''],
    ['smtp_port', '587'],
    ['smtp_user', ''],
    ['smtp_from', ''],
  ]

  const upsert = sqlite.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
  for (const [key, value] of defaultSettings) {
    upsert.run(key, value)
  }
  console.log('Default settings initialized.')

  // Default pages
  const chiSiamo = sqlite.prepare('SELECT id FROM pages WHERE slug = ?').get('chi-siamo')
  if (!chiSiamo) {
    sqlite.prepare('INSERT INTO pages (title, slug, content, seo_title, meta_description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      'Chi siamo',
      'chi-siamo',
      '<p>Sempre in Viaggio è il progetto di Michele Romano, appassionato di viaggi lenti, cicloviaggI e destinazioni autentiche.</p>',
      'Chi siamo — Sempre in Viaggio',
      'Scopri chi c\'è dietro Sempre in Viaggio, il blog di viaggi di Michele Romano.',
      now, now
    )
  }

  const privacy = sqlite.prepare('SELECT id FROM pages WHERE slug = ?').get('privacy')
  if (!privacy) {
    sqlite.prepare('INSERT INTO pages (title, slug, content, seo_title, meta_description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      'Privacy Policy',
      'privacy',
      '<h2>Privacy Policy</h2><p>Questa informativa descrive come Sempre in Viaggio raccoglie e utilizza i dati personali degli utenti.</p>',
      'Privacy Policy — Sempre in Viaggio',
      'Informativa sulla privacy di Sempre in Viaggio.',
      now, now
    )
  }

  const cookie = sqlite.prepare('SELECT id FROM pages WHERE slug = ?').get('cookie')
  if (!cookie) {
    sqlite.prepare('INSERT INTO pages (title, slug, content, seo_title, meta_description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      'Cookie Policy',
      'cookie',
      '<h2>Cookie Policy</h2><p>Sempre in Viaggio utilizza cookie tecnici e, con il tuo consenso, cookie analitici di Google Analytics 4.</p>',
      'Cookie Policy — Sempre in Viaggio',
      'Informativa sui cookie di Sempre in Viaggio.',
      now, now
    )
  }

  console.log('Seed completed.')
  sqlite.close()
}

seed().catch(console.error)
