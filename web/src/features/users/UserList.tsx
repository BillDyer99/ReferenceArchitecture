import { useState } from 'react'
import { mockUsers, type User } from './mockUsers'

type SortField = 'name' | 'joinedAt'
type SortDirection = 'asc' | 'desc'

export function UserList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

    // Derived state — recomputed each render from inputs
    // With the React Compiler, no useMemo needed
    const filteredUsers = mockUsers.filter((user) => {
        const term = searchTerm.toLowerCase()
        return (
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        )
    })

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === 'asc' ? comparison : -comparison
    })

    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '1rem' }}>
            <h2>Users</h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                    type="search"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: '1 1 200px', padding: '0.5rem' }}
                />

                <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    style={{ padding: '0.5rem' }}
                >
                    <option value="name">Sort by Name</option>
                    <option value="joinedAt">Sort by Join Date</option>
                </select>

                <select
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value as SortDirection)}
                    style={{ padding: '0.5rem' }}
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>

            <p style={{ color: '#666', fontSize: '0.875rem' }}>
                Showing {sortedUsers.length} of {mockUsers.length} users
            </p>

            {sortedUsers.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No users match your search.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {sortedUsers.map((user) => (
                        <UserRow key={user.id} user={user} />
                    ))}
                </ul>
            )}
        </div>
    )
}

type UserRowProps = {
    user: User
}

function UserRow({ user }: UserRowProps) {
    return (
        <li style={{
            padding: '0.75rem',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <div>
                <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>{user.email}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem' }}>{user.role}</div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                    Joined {new Date(user.joinedAt).toLocaleDateString()}
                </div>
            </div>
        </li>
    )
}