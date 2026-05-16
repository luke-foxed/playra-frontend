import { z } from "zod"

export const paginatedResponse = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(schema),
  })

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
