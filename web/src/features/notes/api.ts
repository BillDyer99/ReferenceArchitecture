import { apiRequest } from '@/shared/api/client'
import type { Note, CreateNoteRequest } from './types'

export const notesApi = {
    list: (signal?: AbortSignal) =>
    apiRequest<Note[]>('/api/notes', { signal }),

    get: (id: number, signal?: AbortSignal) =>
    apiRequest<Note>(`/api/notes/${id}`, { signal }),

    create: (data: CreateNoteRequest) =>
    apiRequest<Note>('/api/notes', { method: 'POST', body: data }),
}