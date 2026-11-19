declare module 'joi-to-swagger' {
  import type { Schema } from 'joi'

  interface J2SResult {
    swagger: Record<string, unknown>
    components?: Record<string, Record<string, unknown>>
  }

  export default function j2s(
    schema: Schema,
    existingComponents?: Record<string, Record<string, unknown>>
  ): J2SResult
}
