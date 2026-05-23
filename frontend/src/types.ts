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
  status: 'available' | 'busy' | 'occupied'
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
  busy_rooms: number
  available_rooms: number
  total_users: number
  active_users: number
  total_events: number
}

export interface RoomPrediction {
  room_id: number
  room_name: string
  minutes_ahead: number
  current_occupancy: number
  predicted_occupancy: number
  capacity: number
  predicted_available_seats: number
  predicted_availability: 'available' | 'moderate' | 'busy' | 'full'
  confidence: number
  model_type: string
}
