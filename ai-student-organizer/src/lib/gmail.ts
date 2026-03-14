import { google } from 'googleapis'
import { Email } from './types'

export function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.gmail({ version: 'v1', auth })
}

function decodeBase64(data: string): string {
  const buff = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  return buff.toString('utf-8')
}

function extractBody(payload: any): string {
  if (!payload) return ''

  // Direct body
  if (payload.body?.data) {
    return decodeBase64(payload.body.data)
  }

  // Multipart: look for text/plain first, then text/html
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64(part.body.data)
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = decodeBase64(part.body.data)
        // Strip HTML tags for plain text
        return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      }
      // Recurse into nested parts
      if (part.parts) {
        const nested = extractBody(part)
        if (nested) return nested
      }
    }
  }

  return ''
}

function getHeader(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''
}

export async function fetchEmails(accessToken: string, maxResults = 50): Promise<Email[]> {
  const gmail = getGmailClient(accessToken)

  // Fetch list of message IDs
  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    // Filter out promotions/social/spam
    q: 'in:inbox -category:promotions -category:social',
  })

  const messages = listRes.data.messages || []

  // Fetch each message in parallel (batch of 20 to avoid rate limits)
  const emails: Email[] = []
  const batchSize = 20

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize)
    const results = await Promise.allSettled(
      batch.map((msg) =>
        gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'full',
        })
      )
    )

    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      const msg = result.value.data
      if (!msg.payload) continue

      const headers = msg.payload.headers || []
      const body = extractBody(msg.payload)
      const date = getHeader(headers, 'date')

      emails.push({
        id: msg.id!,
        sender: getHeader(headers, 'from'),
        subject: getHeader(headers, 'subject') || '(no subject)',
        snippet: msg.snippet || '',
        body: body.slice(0, 3000), // Cap at 3000 chars for AI processing
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
      })
    }
  }

  return emails
}
