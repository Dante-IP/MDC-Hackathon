import { GoogleGenerativeAI } from '@google/generative-ai'
import { Email, CategorizedEmail, EmailCategory, CATEGORIES } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function getModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.1 },
  })
}

const SYSTEM_PROMPT = `You are an AI assistant helping university students organize their emails.

Here are examples of correct categorization:

Subject: "Summer 2026 Software Engineering Internship at Google"
From: recruiting@google.com
Body: We are excited to invite you to apply for our Summer 2026 SWE Internship program. Application deadline is March 31.
Category: Career
Summary: Google is recruiting for summer 2026 SWE internships with application deadline March 31.

Subject: "Undergraduate Research Assistant Position - ML Lab"
From: prof.smith@umich.edu
Body: I am looking for motivated undergraduates to join my machine learning lab starting next semester. Please send your resume and transcript.
Category: Research
Summary: Professor Smith is looking for undergrad research assistants for his machine learning lab starting next semester.

Subject: "NSF Graduate Research Fellowship - Info Session"
From: gradschool@umich.edu
Body: Learn how to apply for the NSF GRFP, a fellowship worth $37,000/year for graduate students in STEM fields. Deadline October 15.
Category: Opportunities
Summary: Info session about applying for the NSF Graduate Research Fellowship worth $37,000/year, deadline October 15.

Subject: "Campus Career Fair - March 20th"
From: careercenter@umich.edu
Body: Join us for our annual career fair with 50+ companies attending on March 20th in the Michigan Union, 10am-4pm.
Category: Events
Summary: Annual campus career fair with 50+ companies on March 20th at the Michigan Union.

Subject: "Part-time Barista Position - Michigan Union"
From: studentjobs@umich.edu
Body: We are hiring part-time baristas at the Michigan Union coffee shop. 10-15 hours/week, flexible scheduling around classes.
Category: Jobs
Summary: Part-time barista position at the Michigan Union, 10-15 hours/week with flexible scheduling.

Subject: "Free Tutoring Services at the Learning Center"
From: learningcenter@umich.edu
Body: The Learning Center offers free tutoring for all STEM courses. Walk-ins welcome Monday-Friday 9am-8pm.
Category: Campus Resources
Summary: Free STEM tutoring available at the Learning Center, walk-ins welcome Monday-Friday.

Subject: "Your Amazon order has shipped"
From: shipment-tracking@amazon.com
Body: Your order #123-456 has shipped and will arrive by Thursday.
Category: Other
Summary: Amazon shipping notification for a recent order.

Now categorize the emails below using these exact category definitions:

CATEGORY DEFINITIONS:
- Opportunities: Scholarships, fellowships, grants, awards, competitions, or programs that require an APPLICATION or have a DEADLINE for money/program access. If it requires applying for funding or a selective program, it's Opportunities.
- Career: Internships specifically (paid, company-based, summer/semester positions). Co-ops. Career fairs. Resume/interview workshops. Recruiting emails directly from companies. LinkedIn job alerts.
- Research: Faculty research positions, lab openings, REUs (Research Experiences for Undergraduates), academic research programs, thesis/dissertation opportunities. Emails from professors about joining their research group.
- Campus Resources: University services announcements — health center, counseling, financial aid, library, IT support, academic advising, dining, housing, registration, general university-wide announcements.
- Jobs: Part-time jobs, on-campus employment, work-study positions, hourly/wage jobs. NOT internships (those are Career).
- Events: One-time events with a specific date/time — workshops, guest talks, seminars, networking nights, hackathons, club events, info sessions, social events.
- Other: Newsletters, promotional emails, spam, personal emails, receipts, app notifications, or anything that does not clearly benefit a student's academic or professional life.

IMPORTANT RULES:
- If an email mentions a DEADLINE and requires an APPLICATION, prefer Opportunities or Career over Events
- Internships are ALWAYS Career, never Jobs
- Research positions from professors are ALWAYS Research, never Opportunities
- Info sessions ABOUT opportunities are Events, unless the email itself IS the application/opportunity
- If unsure between two categories, pick the one most actionable and useful to a student
- Generic university newsletters with no specific opportunity = Campus Resources
- Emails from professors not about research = Campus Resources`

async function categorizeChunk(emails: Email[]): Promise<CategorizedEmail[]> {
  const emailList = emails
    .map(
      (e, i) => `
[${i}]
Subject: ${e.subject}
From: ${e.sender}
Body: ${e.body ? e.body.slice(0, 500) : e.snippet}`
    )
    .join('\n')

  const prompt = `${SYSTEM_PROMPT}

Here are ${emails.length} emails to categorize:

${emailList}

Return ONLY a valid JSON array with no markdown, no code blocks, no explanation.
One object per email in the same index order:
[
  {"index": 0, "category": "Events", "summary": "One sentence summary."},
  {"index": 1, "category": "Career", "summary": "One sentence summary."}
]`

  try {
    const model = getModel()
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const clean = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    const parsed: { index: number; category: EmailCategory; summary: string }[] =
      JSON.parse(clean)

    return emails.map((email, i) => {
      const match = parsed.find((p) => p.index === i)
      return {
        ...email,
        category: match?.category || 'Other',
        summary: match?.summary || email.snippet,
      }
    })
  } catch (err) {
    console.error('categorizeChunk error:', err)
    return emails.map((email) => ({
      ...email,
      category: 'Other' as EmailCategory,
      summary: email.snippet || 'No summary available.',
    }))
  }
}

export async function categorizeEmails(emails: Email[]): Promise<CategorizedEmail[]> {
  if (emails.length === 0) return []

  const CHUNK_SIZE = 50
  const results: CategorizedEmail[] = []

  for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
    const chunk = emails.slice(i, i + CHUNK_SIZE)
    const chunked = await categorizeChunk(chunk)
    results.push(...chunked)

    if (i + CHUNK_SIZE < emails.length) {
      await new Promise((r) => setTimeout(r, 2000))
    }
  }

  return results
}

export async function chatWithEmails(
  question: string,
  emails: CategorizedEmail[]
): Promise<string> {
  const emailContext = emails
    .slice(0, 20)
    .map(
      (e, i) =>
        `[${i + 1}] From: ${e.sender}\nSubject: ${e.subject}\nDate: ${new Date(e.date).toLocaleDateString()}\nSummary: ${e.summary}`
    )
    .join('\n\n')

  const prompt = `You are a helpful assistant for a university student. You have access to the student's categorized emails and help them find opportunities, deadlines, and key information.
Be concise, direct, and highlight the most important info. Use bullet points when listing multiple items. Always mention deadlines if you spot them.

Here are the relevant emails:

${emailContext}

Question: ${question}`

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
    })
    const result = await model.generateContent(prompt)
    return (
      result.response.text().trim() || 'Sorry, I could not generate a response.'
    )
  } catch (err) {
    console.error('chatWithEmails error:', err)
    return 'Sorry, something went wrong generating a response.'
  }
}