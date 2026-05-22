import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import type { Room } from '../types'
import { QrCode, Loader2, RefreshCw, LogIn, Users } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

function RoomCard({ room, t }: { room: Room; t: (key: string, opts?: Record<string, unknown>) => string }) {
  const pct = room.capacity ? Math.round((room.current_occupancy / room.capacity) * 100) : 0
  const isOccupied = room.status === 'occupied'
  return (
    <div className={`bg-slate-800 border rounded-xl p-5 flex flex-col gap-3 transition-colors ${isOccupied ? 'border-red-500/30' : 'border-green-500/20'}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-white text-base leading-tight">{room.name}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${isOccupied ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'}`}>
          {isOccupied ? t('common.occupied') : t('common.available')}
        </span>
      </div>

      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-bold text-white tabular-nums">{room.current_occupancy}</span>
        <span className="text-slate-400 text-sm mb-1">/ {room.capacity}</span>
        <span className="text-slate-500 text-xs mb-1 ml-1">{t('board.people')}</span>
      </div>

      <div className="space-y-1">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{t('board.capacity', { cap: room.capacity })}</span>
          <span>{pct}%</span>
        </div>
      </div>
    </div>
  )
}

export default function BoardPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(new Date())

  const load = useCallback(async () => {
    try {
      const data = await api.getRooms()
      setRooms(data.rooms)
      setUpdatedAt(new Date())
      setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
    const timer = setInterval(load, 30_000)
    return () => clearInterval(timer)
  }, [load])

  const occupied = rooms.filter(r => r.status === 'occupied').length
  const available = rooms.length - occupied
  const timeLocale = i18n.language === 'en' ? 'en-US' : i18n.language === 'ja' ? 'ja-JP' : 'zh-TW'

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">{t('app.name')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t('board.loginBtn')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Title */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('board.title')}</h1>
            <p className="text-slate-400 text-sm mt-1">{t('board.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-3.5 h-3.5" />
            {t('board.lastUpdated', { time: updatedAt.toLocaleTimeString(timeLocale) })}
          </div>
        </div>

        {/* Summary stats */}
        {!loading && rooms.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('board.statTotal'), value: rooms.length, color: 'text-white', bg: 'bg-slate-800 border-slate-700' },
              { label: t('common.occupied'), value: occupied, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/20' },
              { label: t('common.available'), value: available, color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/20' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
        )}

        {/* Room grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl py-16 text-center text-slate-500 text-sm">
            {t('board.empty')}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map(r => (
              <RoomCard key={r.room_id} room={r} t={t} />
            ))}
          </div>
        )}

        {/* Footer hint */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-600 pt-2">
          <Users className="w-3.5 h-3.5" />
          {t('board.adminHint')}
          <button onClick={() => navigate('/login')} className="text-blue-500 hover:text-blue-400 transition-colors underline underline-offset-2">
            {t('board.loginBtn')}
          </button>
        </div>
      </main>
    </div>
  )
}
