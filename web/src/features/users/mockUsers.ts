export type User = {
    id: string
    name: string
    email: string
    joinedAt: string  // ISO date
    role: 'admin' | 'editor' | 'viewer'
}

export const mockUsers: User[] = [
    { id: '1', name: 'Alice Chen', email: 'alice@example.com', joinedAt: '2024-03-15', role: 'admin' },
    { id: '2', name: 'Bob Martinez', email: 'bob@example.com', joinedAt: '2023-11-02', role: 'editor' },
    { id: '3', name: 'Carol Singh', email: 'carol@example.com', joinedAt: '2025-01-20', role: 'viewer' },
    { id: '4', name: 'David Park', email: 'david@example.com', joinedAt: '2024-07-08', role: 'editor' },
    { id: '5', name: 'Elena Volkov', email: 'elena@example.com', joinedAt: '2022-05-12', role: 'admin' },
    { id: '6', name: 'Frank Okonkwo', email: 'frank@example.com', joinedAt: '2025-09-30', role: 'viewer' },
    { id: '7', name: 'Grace Liu', email: 'grace@example.com', joinedAt: '2023-08-17', role: 'editor' },
    { id: '8', name: 'Henry Schmidt', email: 'henry@example.com', joinedAt: '2024-12-04', role: 'viewer' },
]