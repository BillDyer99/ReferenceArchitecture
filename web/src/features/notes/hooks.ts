import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notesApi } from './api'
import type { CreateNoteRequest, Note } from './types'

const notesQueryKey = ['notes'] as const

export function useNotes() {
    return useQuery({
        queryKey: notesQueryKey,
        queryFn: ({ signal }) => notesApi.list(signal),
    })
}

export function useNote(id: number) {
    return useQuery({
        queryKey: [...notesQueryKey, id],
        queryFn: ({ signal }) => notesApi.get(id, signal),
        enabled: id > 0,
    })
}

export function useCreateNote() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateNoteRequest) => notesApi.create(data),
        onSuccess: (newNote: Note) => {
            // Update the cached list optimistically
            queryClient.setQueryData<Note[]>(notesQueryKey, (old) =>
                old ? [newNote, ...old] : [newNote],
            )
        },
    })
}