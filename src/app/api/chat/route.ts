import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { auth } from '@/lib/auth'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { message, context } = await req.json()
    if (!message || !context) return NextResponse.json({ error: 'Message and context required' }, { status: 400 })

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: 'Sen, kullanıcının yüklediği bir nota (metne) dayalı olarak soruları yanıtlayan bir asistansın. Sadece verilen nota göre cevap ver. Eğer sorunun cevabı notta yoksa, "Bu bilgi notta yer almıyor" şeklinde belirt.'
    })

    const prompt = `
      Kullanıcının Notu (Bağlam):
      """
      ${context.slice(0, 20000)}
      """

      Kullanıcının Sorusu: ${message}
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    
    return NextResponse.json({ answer: response.text() })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Cevap üretilemedi' }, { status: 500 })
  }
}
