# 📬 InboxIQ — AI Student Email Organizer

An AI-powered dashboard that connects to Gmail, reads your emails, categorizes them using GPT-4o-mini, and lets you ask questions about them in a chat interface.

---

## ✨ Features

- **Google OAuth login** — read-only Gmail access
- **Automatic AI categorization** — Opportunities, Career, Research, Campus Resources, Jobs, Events, Other
- **AI summaries** — 1–2 sentence summary per email
- **Dashboard** — category cards with counts at a glance
- **Category pages** — browse all emails in a category
- **Email detail** — full email text + AI summary
- **AI chat** — ask questions about your emails per category

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd ai-student-organizer
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...        # run: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=...
```

### 3. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Copy **Client ID** and **Client Secret** to `.env.local`
8. Go to **APIs & Services → Library**
9. Enable **Gmail API**
10. Go to **OAuth consent screen**, add your Gmail as a test user

### 4. Get OpenAI API key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add to `.env.local` as `OPENAI_API_KEY`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing / Sign-in page
│   ├── layout.tsx                # Root layout with fonts + session
│   ├── globals.css               # Tailwind + custom styles
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard (category cards)
│   ├── category/
│   │   └── [slug]/page.tsx       # Category email list + AI chat
│   ├── email/
│   │   └── [id]/page.tsx         # Individual email detail
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── emails/route.ts       # GET cached / POST fetch+categorize
│       └── chat/route.ts         # AI chat endpoint
├── lib/
│   ├── types.ts                  # TypeScript types + category metadata
│   ├── store.ts                  # In-memory email store
│   ├── gmail.ts                  # Gmail API integration
│   ├── openai.ts                 # OpenAI categorization + chat
│   └── auth.ts                   # NextAuth config
├── components/
│   └── SessionProvider.tsx       # Client-side session wrapper
└── types/
    └── next-auth.d.ts            # NextAuth type extensions
```

---

## 🔌 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/emails` | Return cached emails for session user |
| POST | `/api/emails` | Fetch from Gmail + AI categorize |
| POST | `/api/chat` | AI chat over emails `{ question, category? }` |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers |

---

## 🧠 AI Prompt Design

**Categorization** (`gpt-4o-mini`, temp 0.2):
- Takes subject, sender, snippet, and body (truncated to 1500 chars)
- Returns strict JSON: `{ "category": "...", "summary": "..." }`
- Uses low temperature for consistent categorization

**Chat** (`gpt-4o-mini`, temp 0.4):
- Takes up to 20 emails from the category as context
- Answers natural language questions about them
- Uses higher temperature for more helpful, conversational responses

---

## 💡 Hackathon Extensions

Here are ideas to build on top of this MVP:

- **Deadline detection** — extract dates from emails and show a timeline
- **Priority scoring** — rank emails by urgency and relevance
- **Email notifications** — alert on new opportunities
- **Persistent storage** — swap in-memory store for Postgres/Redis
- **Multiple accounts** — support multiple Gmail accounts
- **Export** — export opportunities to a spreadsheet
- **Browser extension** — inject summaries into Gmail

---

## ⚠️ Notes

- **In-memory store**: Emails reset when the server restarts. For production, use a real database.
- **Rate limits**: The app fetches 30 emails and categorizes in batches of 5 to stay within OpenAI rate limits.
- **Gmail quota**: Gmail API allows 1 billion units/day; reading messages costs 5 units each.
- **OAuth scopes**: Only `gmail.readonly` is requested — the app cannot send or modify emails.

---

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TailwindCSS**
- **NextAuth.js** (Google OAuth)
- **Google APIs** (Gmail)
- **OpenAI** (GPT-4o-mini)
- **TypeScript**
