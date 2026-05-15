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
    highlights: n.highlights ? JSON.parse(n.highlights) : [],
    questions: n.questions ? JSON.parse(n.questions) : [],
    flashcards: n.flashcards ? JSON.parse(n.flashcards) : [],
    examQuestions: n.examQuestions ? JSON.parse(n.examQuestions) : [],
  })))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { title, content, courseId, courseName: newCourseName } = await req.json()
    if (!title || !content) return NextResponse.json({ error: 'Baslik ve icerik zorunludur' }, { status: 400 })
    
    let resolvedCourseId = courseId
    let finalCourseName = undefined

    if (newCourseName && !resolvedCourseId) {
      // Find or create course by name
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
    const note = await prisma.note.create({
      data: {
        title, content, userId, courseId: resolvedCourseId,
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
      ...note, 
      bulletPoints: summary.bulletPoints, 
      highlights: summary.highlights, 
      questions: summary.questions,
      flashcards: summary.flashcards,
      examQuestions: summary.examQuestions
    }, { status: 201 })
  } catch (error) {
    console.error('Note creation error:', error)
    return NextResponse.json({ error: 'Not olusturulamadi' }, { status: 500 })
  }
}