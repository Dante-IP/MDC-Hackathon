export type EmailCategory =
  | 'Opportunities'
  | 'Career'
  | 'Research'
  | 'Campus Resources'
  | 'Jobs'
  | 'Events'
  | 'Other'

export interface Email {
  id: string
  sender: string
  subject: string
  snippet: string
  body: string
  date: string
  category?: EmailCategory
  summary?: string
}

export interface CategorizedEmail extends Email {
  category: EmailCategory
  summary: string
}

export const CATEGORIES: EmailCategory[] = [
  'Opportunities',
  'Career',
  'Research',
  'Campus Resources',
  'Jobs',
  'Events',
  'Other',
]

export const CATEGORY_META: Record<
  EmailCategory,
  { icon: string; color: string; bg: string; border: string; description: string }
> = {
  Opportunities: {
    icon: '🚀',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    description: 'Scholarships, fellowships, and special programs',
  },
  Career: {
    icon: '💼',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'Internships, co-ops, and career fairs',
  },
  Research: {
    icon: '🔬',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    description: 'Research positions and lab openings',
  },
  'Campus Resources': {
    icon: '🏛️',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    description: 'Campus services, support, and announcements',
  },
  Jobs: {
    icon: '📋',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    description: 'Part-time, full-time, and on-campus jobs',
  },
  Events: {
    icon: '📅',
    color: 'text-pink-700',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    description: 'Workshops, seminars, networking events',
  },
  Other: {
    icon: '📨',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    description: 'Everything else',
  },
}
