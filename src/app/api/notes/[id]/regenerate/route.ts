import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type } = await req.json()
    if (!type || !['qa', 'flashcards'].includes(type)) {
      return NextResponse.json({ error: 'Gecersiz tip' }, { status: 400 })
    }

    const note = await prisma.note.findUnique({ where: { id: id }, include: { course: true } })
    if (!note || note.userId !== userId) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Groq API Key eksik' }, { status: 500 })
    const groq = new Groq({ apiKey })

    const courseContext = note.course?.name ? `Bu not "${note.course.name}" dersine aittir. Yeni içerikleri bu dersin akademik bağlamına uygun hazırla.` : ''
    
    let prompt = ''
    if (type === 'qa') {
      prompt = `
        Aşağıdaki metni analiz et ve KESİNLİKLE GEÇERLİ BİR JSON döndür.
        ${courseContext}
        Metnin içeriğiyle doğrudan ilgili, yepyeni ve daha önce sormadığın, sınav zorluğunda 5-7 adet soru ve cevap üret.
        
        JSON FORMATI:
        { "questions": [{"question": "Yeni zor soru", "answer": "Detaylı cevap"}] }
        
        METİN:
        ${note.content.slice(0, 20000)}
      `
    } else if (type === 'flashcards') {
      prompt = `
        Aşağıdaki metni analiz et ve KESİNLİKLE GEÇERLİ BİR JSON döndür.
        ${courseContext}
        Öğrenmeyi kolaylaştırmak için ön yüzünde kavram/soru, arka yüzünde açıklama olan yepyeni EN AZ 10 ADET flashcard üret.
        
        JSON FORMATI:
        { "flashcards": [{"front": "Kavram", "back": "Açıklama"}] }
        
        METİN:
        ${note.content.slice(0, 20000)}
      `
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Sen profesyonel bir eğitim asistanısın. Yalnızca geçerli JSON nesnesi döndür.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      response_format: { type: 'json_object' }
    })

    const rawText = completion.choices[0]?.message?.content || '{}'
    const data = JSON.parse(rawText)

    if (type === 'qa' && data.questions) {
      await prisma.note.update({
        where: { id: note.id },
        data: { questions: JSON.stringify(data.questions) }
      })
      return NextResponse.json({ data: data.questions })
    }

    if (type === 'flashcards' && data.flashcards) {
      await prisma.note.update({
        where: { id: note.id },
        data: { flashcards: JSON.stringify(data.flashcards) }
      })
      return NextResponse.json({ data: data.flashcards })
    }

    throw new Error('Gecerli data uretilemedi')
  } catch (error: any) {
    console.error('Regenerate API Error:', error)
    return NextResponse.json({ error: 'Yeniden olusturulamadi' }, { status: 500 })
  }
}
