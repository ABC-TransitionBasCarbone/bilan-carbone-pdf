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
  pdfOptions?: PdfOptions
}

export interface ErrorResponse {
  error: string
}