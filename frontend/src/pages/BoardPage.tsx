import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import type { Room, RoomPrediction } from '../types'
import { QrCode, Loader2, RefreshCw, LogIn, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

const STATUS_STYLE = {
  occupied: { border: 'border-red-500/30', badge: 'bg-red-500/15 text-red-400', bar: 'bg-red-500' },
  busy:     { border: 'border-yellow-500/30', badge: 'bg-yellow-500/15 text-yellow-400', bar: 'bg-yellow-500' },
  available:{ border: 'border-green-500/20', badge: 'bg-green-500/15 text-green-400', bar: 'bg-green-500' },
} as const

type TFunc = (key: string, opts?: Record<string, unknown>) => string

function RoomCard({ room, prediction, t }: { room: Room; prediction?: RoomPrediction; t: TFunc }) {
  const pct = room.capacity ? Math.round((room.current_occupancy / room.capacity) * 100) : 0
  const style = STATUS_STYLE[room.status] ?? STATUS_STYLE.available
  const statusLabel = room.status === 'occupied' ? t('common.occupied') : room.status === 'busy' ? t('common.busy') : t('common.available')

  const delta = prediction ? prediction.predicted_occupancy - prediction.current_occupancy : 0
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus
  const trendColor = delta > 0 ? 'text-red-400' : delta < 0 ? 'text-green-400' : 'text-slate-500'

  return (
    <div className={`bg-slate-800 border rounded-xl p-5 flex flex-col gap-3 transition-colors ${style.border}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-white text-base leading-tight">{room.name}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${style.badge}`}>
          {statusLabel}
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
            className={`h-full rounded-full transition-all ${style.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{t('board.capacity', { cap: room.capacity })}</span>
          <span>{pct}%</span>
        </div>
      </div>

      {prediction && (
        <div className="border-t border-slate-700 pt-2.5 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">{t('board.predict30')}</span>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold tabular-nums">
              {t('board.predictPeople', { n: prediction.predicted_occupancy })}
            </span>
            <span className="text-xs text-slate-600">
              {t('board.predictConfidence', { pct: Math.round(prediction.confidence * 100) })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BoardPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [predictions, setPredictions] = useState<Map<number, RoomPrediction>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(new Date())

  const load = useCallback(async () => {
    try {
      const [roomData, predData] = await Promise.all([
        api.getRooms(),
        api.getPredictions(30),
      ])
      setRooms(roomData.rooms)
      setPredictions(new Map(predData.predictions.map(p => [p.room_id, p])))
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
  const busy = rooms.filter(r => r.status === 'busy').length
  const available = rooms.filter(r => r.status === 'available').length
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t('board.statTotal'), value: rooms.length, color: 'text-white', bg: 'bg-slate-800 border-slate-700' },
              { label: t('common.available'), value: available, color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/20' },
              { label: t('common.busy'), value: busy, color: 'text-yellow-400', bg: 'bg-yellow-500/5 border-yellow-500/20' },
              { label: t('common.occupied'), value: occupied, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/20' },
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
              <RoomCard key={r.room_id} room={r} prediction={predictions.get(r.room_id)} t={t} />
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
