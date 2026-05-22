export interface User {
  user_id: string
  name: string
  email?: string
  privileges: 'admin' | 'normal'
  location: string
}

export interface Room {
  room_id: number
  name: string
  capacity: number
  current_occupancy: number
  status: 'available' | 'occupied'
}

export interface DoorEvent {
  event_id: string
  room_id: number
  user_id: string
  timestamp: string
  event_type: 'checkin' | 'checkout'
  user_name?: string
  room_name?: string
}

export interface Stats {
  total_rooms: number
  occupied_rooms: number
  available_rooms: number
  total_users: number
  active_users: number
  total_events: number
}
