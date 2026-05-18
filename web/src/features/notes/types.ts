export type Note = {
    id: number
    title: string
    body: string | null
    createdAt: string  // ISO date string from the API
}

export type CreateNoteRequest = {
    title: string
    body?: string
}