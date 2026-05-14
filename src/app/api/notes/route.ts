import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { summarize } from '@/lib/huggingface'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const notes = await prisma.note.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(notes.map(n => ({
    ...n,
    bulletPoints: n.bulletPoints ? JSON.parse(n.bulletPoints) : [],
    keywords: n.keywords ? JSON.parse(n.keywords) : [],
    questions: n.questions ? JSON.parse(n.questions) : [],
  })))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { title, content } = await req.json()
    if (!title || !content) return NextResponse.json({ error: 'Baslik ve icerik zorunludur' }, { status: 400 })
    const summary = await summarize(content)
    const note = await prisma.note.create({
      data: {
        title, content, userId,
        shortSummary: summary.shortSummary,
        bulletPoints: JSON.stringify(summary.bulletPoints),
        keywords: JSON.stringify(summary.keywords),
        questions: JSON.stringify(summary.questions),
        language: summary.language,
        wordCount: content.split(/\s+/).length,
      },
    })
    return NextResponse.json({ ...note, bulletPoints: summary.bulletPoints, keywords: summary.keywords, questions: summary.questions }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Not olusturulamadi' }, { status: 500 })
  }
}