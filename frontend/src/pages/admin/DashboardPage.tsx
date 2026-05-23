import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../api'
import type { Room, DoorEvent, Stats } from '../../types'
import { Building2, CheckCircle, Activity, Loader2 } from 'lucide-react'

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [events, setEvents] = useState<DoorEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [s, r, e] = await Promise.all([api.admin.stats(), api.admin.rooms(), api.admin.events()])
      setStats(s); setRooms(r.rooms); setEvents(e.events.slice(0, 8)); setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load(); const timer = setInterval(load, 30_000); return () => clearInterval(timer) }, [load])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400">{error}</div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="text-slate-400 text-sm mt-0.5">{t('dashboard.subtitle')}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={<Building2 className="w-5 h-5 text-blue-400" />} label={t('dashboard.statRooms')} value={stats.total_rooms} color="bg-blue-500/15" />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-green-400" />} label={t('dashboard.statAvailable')} value={stats.available_rooms} color="bg-green-500/15" />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-yellow-400" />} label={t('dashboard.statBusy')} value={stats.busy_rooms} color="bg-yellow-500/15" />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-red-400" />} label={t('dashboard.statOccupied')} value={stats.occupied_rooms} color="bg-red-500/15" />
          <StatCard icon={<Activity className="w-5 h-5 text-purple-400" />} label={t('dashboard.statEvents')} value={stats.total_events} color="bg-purple-500/15" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room grid */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">{t('dashboard.sectionRooms')}</h2>
            <button onClick={() => navigate('/admin/rooms')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {rooms.map(r => {
              const pct = r.capacity ? Math.round((r.current_occupancy / r.capacity) * 100) : 0
              return (
                <button key={r.room_id} onClick={() => navigate('/admin/rooms')}
                  className="bg-slate-900 hover:bg-slate-700/60 border border-slate-700 rounded-xl p-4 text-left transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{r.name}</span>
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${r.status === 'occupied' ? 'bg-red-500' : r.status === 'busy' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  </div>
                  <div className="text-xl font-bold text-blue-400">
                    {r.current_occupancy}<span className="text-sm text-slate-500 font-normal"> / {r.capacity}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {r.status === 'occupied' ? t('common.occupied') : r.status === 'busy' ? t('common.busy') : t('common.available')}
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent events */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">{t('dashboard.sectionLogs')}</h2>
            <button onClick={() => navigate('/admin/logs')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className="divide-y divide-slate-700">
            {events.length === 0 && <p className="text-center text-slate-500 text-sm py-8">{t('dashboard.noLogs')}</p>}
            {events.map(e => (
              <div key={e.event_id} className="flex items-center gap-3 px-5 py-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${e.event_type === 'checkin' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{e.user_name ?? e.user_id}</div>
                  <div className="text-xs text-slate-500 truncate">{e.room_name ?? `Room ${e.room_id}`}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${e.event_type === 'checkin' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                  {e.event_type === 'checkin' ? t('common.checkin') : t('common.checkout')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Online users */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-2">
          <h2 className="font-semibold text-white">{t('dashboard.sectionUsers')}</h2>
          {stats && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full ml-auto">
              {t('dashboard.onlineCount', { online: stats.active_users, total: stats.total_users })}
            </span>
          )}
        </div>
        <div className="p-4 text-sm text-slate-400 text-center">
          <button onClick={() => navigate('/admin/users')} className="text-blue-400 hover:text-blue-300 transition-colors">
            {t('dashboard.goToUsers')}
          </button>
        </div>
      </div>
    </div>
  )
}
