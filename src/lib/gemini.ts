import { GoogleGenerativeAI } from '@google/generative-ai'
import { SummaryResult } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function summarizeWithGemini(text: string): Promise<SummaryResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim() === '') return null

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: 'Sen profesyonel bir metin analistisin. Görevin, verilen metinleri en ince ayrıntısına kadar inceleyip, okuyucunun konuyu kavramasını sağlayacak akademik düzeyde özet ve sorular üretmektir.'
    })

    const prompt = `
      Aşağıdaki metni analiz et ve kesinlikle JSON formatında bir yanıt döndür.
      
      KRİTİK KURALLAR:
      1. ÖZETLER: Metni üç farklı uzunlukta özetle. BU ÜÇ ÖZET KESİNLİKLE BİRBİRİNDEN FARKLI VE FARKLI UZUNLUKTA OLMALIDIR. Aynı metni kopyalama.
         - shortSummary: En temel fikri veren çok kısa 1-2 cümle.
         - mediumSummary: Ana başlıkları ve sonuçları kapsayan 1-2 paragraf.
         - detailedSummary: Metnin tüm önemli noktalarını, argümanlarını ve detaylarını kapsayan çok detaylı ve uzun bir özet.
      2. MADDELER (bulletPoints): Metindeki önemli detayları 5-10 maddelik liste yap.
      3. SORU-CEVAP (questions): Metnin İÇERİĞİYLE DOĞRUDAN İLGİLİ, spesifik ve bağlama dayalı 3-5 adet soru ve detaylı cevap üret. Genel geçer sorular sorma.
      4. FLASHCARDS: Öğrenmeyi kolaylaştırmak için ön yüzünde kavram/soru, arka yüzünde kısa açıklama/cevap olan 5 adet bilgi kartı.
      5. SINAV SORULARI: Metni test etmek için çoktan seçmeli (A, B, C, D) 3-5 adet sınav sorusu hazırla. Doğru cevabı ve neden o cevabın doğru olduğunu (explanation) ekle.
      6. FORMAT: Sadece JSON döndür. Başka hiçbir açıklama yazma.
      
      JSON YAPISI:
      {
        "shortSummary": "...",
        "mediumSummary": "...",
        "detailedSummary": "...",
        "bulletPoints": ["...", "..."],
        "keywords": ["...", "..."],
        "questions": [{"question": "Konuya özel zor bir soru", "answer": "Metne dayalı açıklayıcı cevap"}],
        "flashcards": [{"front": "Kavram/Soru", "back": "Açıklama/Cevap"}],
        "examQuestions": [
          {
            "question": "Soru metni",
            "options": ["A) Seçenek", "B) Seçenek", "C) Seçenek", "D) Seçenek"],
            "answer": "Doğru Seçenek (A, B, C veya D)",
            "explanation": "Neden bu cevap doğru?"
          }
        ],
        "language": "tr"
      }

      METİN:
      ${text.slice(0, 20000)}
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const rawText = response.text()
    
    // JSON ayıklama: İlk { ve son } arasındaki her şeyi al
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('AI geçerli bir JSON üretmedi')
    
    const jsonText = rawText.substring(start, end + 1)
    const data = JSON.parse(jsonText)
    
    return {
      shortSummary: data.shortSummary,
      mediumSummary: data.mediumSummary || data.shortSummary,
      detailedSummary: data.detailedSummary || data.shortSummary,
      bulletPoints: data.bulletPoints,
      keywords: data.keywords,
      questions: data.questions,
      flashcards: data.flashcards || [],
      examQuestions: data.examQuestions || [],
      language: data.language || 'tr',
      method: 'gemini'
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    return null
  }
}
