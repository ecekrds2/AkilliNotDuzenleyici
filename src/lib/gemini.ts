import Groq from 'groq-sdk'
import { SummaryResult } from '@/types'

export async function summarizeWithGemini(text: string): Promise<SummaryResult | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey.trim() === '') return null

  try {
    const groq = new Groq({ apiKey })

    const prompt = `
      Aşağıdaki metni analiz et ve KESİNLİKLE GEÇERLİ BİR JSON nesnesi (object) döndür.
      
      KRİTİK KURALLAR:
      1. ÖZETLER: Metni üç farklı uzunlukta özetle. BU ÜÇ ÖZET KESİNLİKLE BİRBİRİNDEN FARKLI VE FARKLI UZUNLUKTA OLMALIDIR. Aynı metni kopyalama.
         - shortSummary: En temel fikri veren çok kısa 1-2 cümle.
         - mediumSummary: Ana başlıkları ve sonuçları kapsayan 1-2 paragraf.
         - detailedSummary: Metnin tüm önemli noktalarını, argümanlarını ve detaylarını kapsayan çok detaylı ve uzun bir özet.
      2. MADDELER (bulletPoints): Metindeki önemli detayları 5-10 maddelik liste yap.
      3. SORU-CEVAP (questions): Metnin İÇERİĞİYLE DOĞRUDAN İLGİLİ, spesifik ve bağlama dayalı 3-5 adet soru ve detaylı cevap üret. Genel geçer sorular sorma.
      4. FLASHCARDS: Öğrenmeyi kolaylaştırmak için ön yüzünde kavram/soru, arka yüzünde kısa açıklama/cevap olan 5 adet bilgi kartı.
      5. SINAV SORULARI: Metni test etmek için çoktan seçmeli (A, B, C, D) 3-5 adet sınav sorusu hazırla. Doğru cevabı ve neden o cevabın doğru olduğunu (explanation) ekle.
      6. FORMAT: Sadece ve sadece JSON döndür. Markdown blokları (\`\`\`json) KULLANMA.
      
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

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'Sen profesyonel bir metin analistisin. Görevin, verilen metinleri en ince ayrıntısına kadar inceleyip akademik düzeyde özet ve sorular üretmektir. Yalnızca geçerli bir JSON objesi döndür.' 
        },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const rawText = completion.choices[0]?.message?.content || '{}'
    
    // JSON parse
    const data = JSON.parse(rawText)
    
    return {
      shortSummary: data.shortSummary || '',
      mediumSummary: data.mediumSummary || data.shortSummary || '',
      detailedSummary: data.detailedSummary || data.shortSummary || '',
      bulletPoints: data.bulletPoints || [],
      keywords: data.keywords || [],
      questions: data.questions || [],
      flashcards: data.flashcards || [],
      examQuestions: data.examQuestions || [],
      language: data.language || 'tr',
      method: 'groq'
    }
  } catch (error) {
    console.error('Groq API Error:', error)
    return null
  }
}
