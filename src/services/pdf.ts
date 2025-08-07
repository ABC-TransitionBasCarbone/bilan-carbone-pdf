import jwt from 'jsonwebtoken'
import { Browser, chromium } from 'playwright'
import { PdfOptions } from '../types'

export class PdfGenerationService {
  private isRunningInDocker(): boolean {
    return process.env.DOCKER_CONTAINER === 'true'
  }

  private async generatePdfWithToken(url: string, token: string, pdfOptions: PdfOptions = {}): Promise<Buffer> {
    let browser: Browser | null = null

    try {
      jwt.verify(token, process.env.JWT_SECRET!)

      browser = await chromium.launch({
        headless: true,
        timeout: 30000,
      })

      const context = await browser.newContext()
      const page = await context.newPage()
      page.setDefaultTimeout(30000)
      page.setDefaultNavigationTimeout(30000)

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

      const content = await page.content()
      if (!content.includes('pdf-container')) {
        console.error('500 - PDF content not properly loaded')
        throw new Error('PDF content not properly loaded')
      }

      const defaultOptions = {
        format: 'A4' as const,
        printBackground: true,
        margin: { top: '2cm', bottom: '2cm', left: '1.5cm', right: '1.5cm' },
      }

      const finalOptions = { ...defaultOptions, ...pdfOptions }
      const pdfBuffer = await page.pdf(finalOptions)

      return pdfBuffer
    } catch (jwtError: any) {
      if (jwtError.name === 'JsonWebTokenError' || jwtError.name === 'TokenExpiredError') {
        console.error('500 - Invalid or expired authentication token')
        throw new Error('Invalid or expired authentication token')
      }
      throw jwtError
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }

  async create(url: string, token: string, pdfOptions?: PdfOptions): Promise<Buffer> {
    if (this.isRunningInDocker() && url.startsWith('http://localhost:3000')) {
      // Allows to access the local server from the docker container during local development
      url = url.replace('http://localhost:3000', 'http://host.docker.internal:3000')
    }

    return this.generatePdfWithToken(url, token, pdfOptions)
  }
}
