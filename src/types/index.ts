export interface Note {
  id: string
  title: string
  content: string
  shortSummary?: string
  bulletPoints?: string[]
  keywords?: string[]
  questions?: { question: string, answer: string }[]
  language?: string
  wordCount?: number
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface SummaryResult {
  shortSummary: string
  bulletPoints: string[]
  keywords: string[]
  questions: { question: string, answer: string }[]
  language: string
  method: 'huggingface' | 'offline'
}