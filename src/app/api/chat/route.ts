import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API Key eksik' }, { status: 500 })

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const { message, context } = await req.json()
    if (!message || !context) return NextResponse.json({ error: 'Message and context required' }, { status: 400 })

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: 'Sen, kullanıcının yüklediği bir nota (metne) dayalı olarak soruları yanıtlayan profesyonel bir asistansın. Sadece verilen nota göre cevap ver. Eğer sorunun cevabı notta yoksa, "Bu bilgi notta yer almıyor" şeklinde belirt.'
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
    const answer = response.text()
    
    if (!answer) throw new Error('Bos cevap dondu')
    
    return NextResponse.json({ answer })
  } catch (error: any) {
    console.error('Chat API Error:', error.message || error)
    return NextResponse.json({ error: 'Cevap üretilemedi', details: error.message }, { status: 500 })
  }
}
