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
    highlights: note.highlights ? JSON.parse(note.highlights) : [],
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

  try {
    const { title, content, courseId, courseName: newCourseName } = await req.json()
    if (!title || !content) return NextResponse.json({ error: 'Baslik ve icerik zorunlu' }, { status: 400 })

    const note = await prisma.note.findUnique({ where: { id: id } })
    if (!note || note.userId !== userId) return NextResponse.json({ error: 'Bulunamadi' }, { status: 404 })

    let resolvedCourseId = courseId
    let finalCourseName = undefined

    if (newCourseName && !resolvedCourseId) {
      // Find or create course
      let course = await prisma.course.findFirst({
        where: { userId, name: { equals: newCourseName, mode: 'insensitive' } }
      })
      if (!course) {
        course = await prisma.course.create({ data: { name: newCourseName, userId, color: 'indigo' } })
      }
      resolvedCourseId = course.id
      finalCourseName = course.name
    } else if (resolvedCourseId) {
      const course = await prisma.course.findUnique({ where: { id: resolvedCourseId } })
      if (course) finalCourseName = course.name
    }

    const summary = await summarize(content, finalCourseName)
    const updated = await prisma.note.update({
      where: { id: id },
      data: {
        title, content, courseId: resolvedCourseId,
        shortSummary: summary.shortSummary,
        mediumSummary: summary.mediumSummary,
        detailedSummary: summary.detailedSummary,
        bulletPoints: JSON.stringify(summary.bulletPoints),
        highlights: JSON.stringify(summary.highlights),
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
      highlights: summary.highlights,
      questions: summary.questions,
      flashcards: summary.flashcards,
      examQuestions: summary.examQuestions
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