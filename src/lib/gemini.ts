import { GoogleGenerativeAI } from '@google/generative-ai'
import { SummaryResult } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function summarizeWithGemini(text: string): Promise<SummaryResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim() === '') return null

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      Aşağıdaki metni analiz et ve şu formatta bir JSON yanıtı döndür. 
      Yanıt kesinlikle sadece geçerli bir JSON olmalı, başka metin içermemeli.
      JSON yapısı:
      {
        "shortSummary": "Metnin ana fikrini anlatan 2-3 cümlelik akıcı bir özet",
        "bulletPoints": ["Önemli noktaları içeren en az 5-10 maddelik liste"],
        "keywords": ["Metindeki en önemli 5-10 anahtar kelime"],
        "questions": [
          {"question": "Metinle ilgili düşündürücü bir soru", "answer": "Metne dayalı detaylı cevap"}
        ],
        "language": "tr" veya "en"
      }

      Metin:
      ${text.slice(0, 10000)}
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const jsonText = response.text().replace(/```json/g, '').replace(/```/g, '').trim()
    
    const data = JSON.parse(jsonText)
    
    return {
      shortSummary: data.shortSummary,
      bulletPoints: data.bulletPoints,
      keywords: data.keywords,
      questions: data.questions,
      language: data.language || 'tr',
      method: 'gemini'
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    return null
  }
}
