export interface Cookie {
  name: string
  value: string
  domain: string
  path: string
}

export interface PdfOptions {
  format?: string
  printBackground?: boolean
  margin?: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
}

export interface GeneratePdfRequest {
  url: string
  cookies?: Cookie[]
  pdfOptions?: PdfOptions
}

export interface ErrorResponse {
  error: string
}