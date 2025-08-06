import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { authenticateApiKey } from './middleware/auth'
import { PdfGenerationService } from './services/pdf'
import { GeneratePdfRequest } from './types'

const app = express()
const PORT = process.env.PORT || 8080

if (!process.env.API_SECRET_KEY) {
  throw new Error('API_SECRET_KEY environment variable is required')
}

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000']
const allowedIPs = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : []

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

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)

// IP whitelist middleware
app.use((req, res, next) => {
  if (allowedIPs.length > 0) {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown'

    if (clientIP && !allowedIPs.includes(clientIP)) {
      return res.status(403).json({ error: 'IP not allowed' })
    }
  }
  next()
})

app.use(express.json({ limit: '1mb' }))

const pdfService = new PdfGenerationService()

app.get('/', (_, res) => {
  res.json({ message: 'Bilan Carbone PDF API is running!' })
})

app.post('/generate-pdf', authenticateApiKey, async (req, res) => {
  try {
    const { url, cookies, pdfOptions }: GeneratePdfRequest = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    const pdfBuffer = await pdfService.create(url, cookies, pdfOptions)

    res.setHeader('Content-Type', 'application/pdf')
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error generating PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: `PDF generation failed: ${errorMessage}` })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
