const fs = require('fs');

// ── Vercel için PostgreSQL destekli schema ────────────────────────────────
// Önce SQLite ile kalıp production'da Neon kullanacağız
// prisma/schema.prisma - hem sqlite hem postgres destekli

// vercel.json
fs.writeFileSync('vercel.json', JSON.stringify({
  "buildCommand": "npx prisma generate && next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXTAUTH_URL": "https://your-app.vercel.app"
  }
}, null, 2), 'utf8');

// .env.production için örnek
fs.writeFileSync('.env.production.example', `# Vercel Production Environment Variables
# Bunları Vercel Dashboard > Settings > Environment Variables bolumune ekle

DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
# Neon ucretsiz PostgreSQL: https://neon.tech
# Supabase ucretsiz PostgreSQL: https://supabase.com

NEXTAUTH_SECRET="production-icin-guclu-bir-secret-key-olustur"
NEXTAUTH_URL="https://your-app.vercel.app"

# Hugging Face API (ucretsiz): https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY="hf_xxxxxxxxxxxxxxxxxxxx"
`, 'utf8');

// HuggingFace client - birden fazla model dene, fallback
fs.writeFileSync('src/lib/huggingface.ts', `import { SummaryResult } from '@/types'
import { summarizeOffline } from './nlp'

// Ucretsiz HF modelleri (siraya gore denenir)
const HF_MODELS = [
  'csebuetnlp/mT5_multilingual_XLSum',  // Cok dilli, TR destekli
  'facebook/bart-large-cnn',             // Ingilizce icin guclu
]

async function callHFModel(model: string, text: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(\`https://api-inference.huggingface.co/models/\${model}\`, {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${apiKey}\`,
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
      // Model yukleniyor hatasi - 503
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

  // Offline sonucu hazirla (bullet/keywords icin)
  const offline = summarizeOffline(text)

  // Modelleri sirayla dene
  for (const model of HF_MODELS) {
    const summaryText = await callHFModel(model, text, apiKey)
    if (summaryText) {
      return {
        shortSummary: summaryText,
        bulletPoints: offline.bulletPoints,
        keywords: offline.keywords,
        language: offline.language,
        method: 'huggingface',
      }
    }
  }
  return null
}

export async function summarize(text: string): Promise<SummaryResult> {
  const hfResult = await summarizeWithHF(text)
  return hfResult ?? summarizeOffline(text)
}`, 'utf8');

console.log('HuggingFace + Vercel config written!');
