import { SummaryResult } from '@/types'
import { summarizeOffline } from './nlp'
import { summarizeWithGemini } from './gemini'

// Ucretsiz HF modelleri (siraya gore denenir)
const HF_MODELS = [
  'csebuetnlp/mT5_multilingual_XLSum',  // Cok dilli, TR destekli
  'facebook/bart-large-cnn',             // Ingilizce icin guclu
]

async function callHFModel(model: string, text: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text.slice(0, 1500),
        parameters: {
          max_length: 200,
          min_length: 50,
          do_sample: false,
          truncation: true,
        },
        options: { wait_for_model: true },
      }),
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      if (res.status === 503) return null
      console.warn('HF API error:', res.status, err)
      return null
    }

    const data = await res.json()
    const text_out: string = data[0]?.summary_text || data[0]?.generated_text || ''
    return text_out.length > 20 ? text_out : null
  } catch (e) {
    console.warn('HF fetch error:', e)
    return null
  }
}

export async function summarizeWithHF(text: string): Promise<SummaryResult | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey || apiKey.trim() === '') return null

  const offline = summarizeOffline(text)

  for (const model of HF_MODELS) {
    const summaryText = await callHFModel(model, text, apiKey)
    if (summaryText) {
      return {
        shortSummary: summaryText,
        bulletPoints: offline.bulletPoints,
        keywords: offline.keywords,
        questions: offline.questions,
        language: offline.language,
        method: 'huggingface',
      }
    }
  }
  return null
}

export async function summarize(text: string): Promise<SummaryResult> {
  // 1. Gemini (En iyi free AI)
  const geminiResult = await summarizeWithGemini(text)
  if (geminiResult) return geminiResult

  // 2. Hugging Face (Yedek AI)
  const hfResult = await summarizeWithHF(text)
  if (hfResult) return hfResult

  // 3. Offline (Son care)
  return summarizeOffline(text)
}