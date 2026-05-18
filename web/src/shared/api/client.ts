
console.log('All env vars:', import.meta.env)
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured')
}

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: unknown
    signal?: AbortSignal
}

export class ApiError extends Error {
    readonly status: number
    readonly statusText: string
    readonly body: unknown

    constructor(status: number, statusText: string, body: unknown) {
        super(`API ${status}: ${statusText}`)
        this.name = 'ApiError'
        this.status = status
        this.statusText = statusText
        this.body = body
    }
}

export async function apiRequest<T>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const { method = 'GET', body, signal } = options

    const url = `${API_BASE_URL}${path}`

    const response = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal,
    })

    if (!response.ok) {
        let errorBody: unknown = null
        try {
            errorBody = await response.json()
        } catch {
            // Response wasn't JSON; that's fine
        }
        throw new ApiError(response.status, response.statusText, errorBody)
    }

    // 204 No Content
    if (response.status === 204) {
        return undefined as T
    }

    return response.json() as Promise<T>
}