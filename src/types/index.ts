export interface Course {
  id: string
  name: string
  color: string | null
  userId: string
  createdAt: Date
}

export interface Note {
  id: string
  title: string
  content: string
  courseId?: string | null
  course?: Course | null
  shortSummary?: string
  mediumSummary?: string
  detailedSummary?: string
  bulletPoints?: string[]
  highlights?: string[]
  questions?: { question: string, answer: string }[]
  flashcards?: { front: string, back: string }[]
  examQuestions?: { question: string, options: string[], answer: string, explanation: string }[]
  language?: string
  wordCount?: number
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface SummaryResult {
  shortSummary: string
  mediumSummary: string
  detailedSummary: string
  bulletPoints: string[]
  highlights: string[]
  questions: { question: string, answer: string }[]
  flashcards: { front: string, back: string }[]
  examQuestions: { question: string, options: string[], answer: string, explanation: string }[]
  language: string
  method: 'huggingface' | 'offline' | 'gemini' | 'groq'
}