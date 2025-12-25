import { vi } from 'vitest'

export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
      order: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      mockResolvedValue: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    insert: vi.fn().mockResolvedValue({
      data: null,
      error: null,
      select: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    update: vi.fn().mockResolvedValue({
      data: null,
      error: null,
      select: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    delete: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/file.jpg' },
      }),
    })),
  },
}

export const createClient = vi.fn(() => mockSupabaseClient)

