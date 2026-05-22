import type { User, Room, DoorEvent, Stats } from './types'

const BASE: string = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'

let _adminToken: string | null = null

export function setApiAdminToken(token: string | null) {
  _adminToken = token
}

function hdrs(): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (_adminToken) h['Authorization'] = `Bearer ${_adminToken}`
  return h
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, { headers: hdrs(), ...init })
  const json: unknown = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { detail?: string }).detail ?? `HTTP ${res.status}`)
  return json as T
}

export const api = {
  login: (user_id: string, password: string) =>
    req<User & { message: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ user_id, password }),
    }),

  register: (user_id: string, name: string, email: string, password: string) =>
    req<{ message: string; user_id: string }>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ user_id, name, email, password, privileges: 'normal' }),
    }),

  getRooms: () => req<{ rooms: Room[] }>('/rooms'),
  getRoom: (roomId: number) => req<Room>(`/rooms/${roomId}`),

  checkin: (roomId: number, userId: string) =>
    req<DoorEvent>(`/rooms/${roomId}/in`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),

  checkout: (roomId: number, userId: string) =>
    req<DoorEvent>(`/rooms/${roomId}/out`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),

  admin: {
    stats: () => req<Stats>('/admin/stats'),
    rooms: () => req<{ rooms: Room[] }>('/admin/rooms'),
    users: () => req<{ users: User[] }>('/admin/users'),
    events: () => req<{ events: DoorEvent[] }>('/admin/events'),
    createRoom: (roomId: number, data: Omit<Room, 'room_id'>) =>
      req('/admin/rooms/' + roomId, {
        method: 'POST',
        body: JSON.stringify({ room_id: roomId, ...data }),
      }),
    deleteRoom: (roomId: number) =>
      req('/admin/rooms/' + roomId, { method: 'DELETE' }),
    roomHistory: (roomId: number) =>
      req<{ events: DoorEvent[]; room_name: string }>(`/admin/rooms/${roomId}/history`),
  },
} as const
