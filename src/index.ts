import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { authenticateApiKey } from './middleware/auth'
import { PdfGenerationService } from './services/pdf'

const app = express()
const PORT = process.env.PORT || 8080

if (!process.env.API_SECRET_KEY) {
  throw new Error('API_SECRET_KEY environment variable is required')
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000']

// Health check endpoint (no CORS restrictions)
app.get('/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Apply CORS to all other routes
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      console.error('CORS error with origin', origin)
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)

app.use(express.json({ limit: '1mb' }))

const pdfService = new PdfGenerationService()

app.get('/', (_, res) => {
  res.json({ message: 'Bilan Carbone PDF API is running!' })
})

app.post('/generate-pdf', authenticateApiKey, async (req, res) => {
  try {
    const { url, pdfOptions } = req.body

    if (!url) {
      console.error('400 - Missing required url field')
      return res.status(400).json({ error: 'URL is required' })
    }

    // Extract token from the URL (e.g., ?t=token_value)
    const urlObj = new URL(url)
    const token = urlObj.searchParams.get('t')

    if (!token) {
      console.error('400 - Missing required token field')
      return res.status(400).json({ error: 'Token parameter (t) is required in URL' })
    }

    const pdfBuffer = await pdfService.create(url, token, pdfOptions)

    res.setHeader('Content-Type', 'application/pdf')
    res.send(pdfBuffer)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('500 - Error generating PDF:', errorMessage)
    res.status(500).json({ error: `PDF generation failed: ${errorMessage}` })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
