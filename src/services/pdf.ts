import { Browser, chromium } from 'playwright'
import { Cookie, PdfOptions } from '../types'

export class PdfGenerationService {
  private async generatePdf(url: string, cookies: Cookie[] = [], pdfOptions: PdfOptions = {}): Promise<Buffer> {
    let browser: Browser | null = null

    try {
      browser = await chromium.launch({
        headless: true,
        timeout: 30000,
      })
      const context = await browser.newContext()

      if (cookies.length > 0) {
        await context.addCookies(cookies)
      } else {
        throw new Error('No cookies provided')
      }

      const page = await context.newPage()
      page.setDefaultTimeout(30000)
      page.setDefaultNavigationTimeout(30000)

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

      const content = await page.content()
      if (!content.includes('pdf-container')) {
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
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }

  private isRunningInDocker(): boolean {
    return process.env.DOCKER_CONTAINER === 'true'
  }

  async create(url: string, cookies?: Cookie[], pdfOptions?: PdfOptions): Promise<Buffer> {
    if (this.isRunningInDocker() && url.startsWith('http://localhost:3000')) {
      // Allows to access the local server from the docker container during local development
      url = url.replace('http://localhost:3000', 'http://host.docker.internal:3000')
    }

    const processedCookies = cookies?.map((cookie) => ({
      ...cookie,
      domain: new URL(url).hostname,
    }))

    return this.generatePdf(url, processedCookies, pdfOptions)
  }
}
