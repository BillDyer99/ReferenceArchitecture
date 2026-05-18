import { useState } from 'react'
import { useNotes, useCreateNote } from './hooks'

export function NotesList() {
    const { data: notes, isLoading, isError, error } = useNotes()
    const createNote = useCreateNote()

    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return

        createNote.mutate(
            { title: title.trim(), body: body.trim() || undefined },
            {
                onSuccess: () => {
                    setTitle('')
                    setBody('')
                },
            },
        )
    }

    if (isLoading) {
        return <p>Loading notes...</p>
    }

    if (isError) {
        return <p style={{ color: 'red' }}>Error: {error.message}</p>
    }

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
    <h2>Notes</h2>

    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
    <input
        type="text"
    placeholder="Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
    required
    />
    <textarea
        placeholder="Body (optional)"
    value={body}
    onChange={(e) => setBody(e.target.value)}
    rows={3}
    style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
    />
    <button type="submit" disabled={createNote.isPending}>
        {createNote.isPending ? 'Saving...' : 'Add Note'}
        </button>
    {createNote.isError && (
        <p style={{ color: 'red', fontSize: '0.875rem' }}>
        Failed to save: {createNote.error.message}
        </p>
    )}
    </form>

    {notes && notes.length === 0 && <p>No notes yet.</p>}

    <ul style={{ listStyle: 'none', padding: 0 }}>
        {notes?.map((note) => (
            <li
                key={note.id}
            style={{
            padding: '0.75rem',
                borderBottom: '1px solid #eee',
                marginBottom: '0.5rem',
        }}
        >
            <strong>{note.title}</strong>
            {note.body && <p style={{ margin: '0.25rem 0' }}>{note.body}</p>}
            <small style={{ color: '#666' }}>
                {new Date(note.createdAt).toLocaleString()}
                </small>
                </li>
            ))}
            </ul>
            </div>
        )
        }