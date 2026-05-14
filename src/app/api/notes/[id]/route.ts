import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { summarize } from '@/lib/huggingface'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const note = await prisma.note.findFirst({ where: { id, userId } })
  if (!note) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  return NextResponse.json({
    ...note,
    bulletPoints: note.bulletPoints ? JSON.parse(note.bulletPoints) : [],
    keywords: note.keywords ? JSON.parse(note.keywords) : [],
    questions: note.questions ? JSON.parse(note.questions) : [],
    flashcards: note.flashcards ? JSON.parse(note.flashcards) : [],
    examQuestions: note.examQuestions ? JSON.parse(note.examQuestions) : [],
  })
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const existing = await prisma.note.findFirst({ where: { id, userId } })
  if (!existing) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  try {
    const { title, content } = await req.json()
    const summary = await summarize(content)
    const updated = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        shortSummary: summary.shortSummary,
        mediumSummary: summary.mediumSummary,
        detailedSummary: summary.detailedSummary,
        bulletPoints: JSON.stringify(summary.bulletPoints),
        keywords: JSON.stringify(summary.keywords),
        questions: JSON.stringify(summary.questions),
        flashcards: JSON.stringify(summary.flashcards),
        examQuestions: JSON.stringify(summary.examQuestions),
        language: summary.language,
        wordCount: content.split(/\s+/).length,
      },
    })
    return NextResponse.json({
      ...updated,
      bulletPoints: summary.bulletPoints,
      keywords: summary.keywords,
      questions: summary.questions,
      flashcards: summary.flashcards,
      examQuestions: summary.examQuestions,
    })
  } catch (error) {
    console.error('Note update error:', error)
    return NextResponse.json({ error: 'Guncelleme basarisiz' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const existing = await prisma.note.findFirst({ where: { id, userId } })
  if (!existing) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  await prisma.note.delete({ where: { id } })
  return NextResponse.json({ success: true })
}