import { useEffect, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../api'
import type { DoorEvent, Room } from '../../types'
import { Loader2, Filter } from 'lucide-react'

export default function LogsPage() {
  const { t, i18n } = useTranslation()
  const [events, setEvents] = useState<DoorEvent[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterRoom, setFilterRoom] = useState('')
  const [filterType, setFilterType] = useState('')

  const load = useCallback(async () => {
    try {
      const [e, r] = await Promise.all([api.admin.events(), api.admin.rooms()])
      setEvents(e.events); setRooms(r.rooms); setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => events.filter(e => {
    if (filterRoom && String(e.room_id) !== filterRoom) return false
    if (filterType && e.event_type !== filterType) return false
    return true
  }), [events, filterRoom, filterType])

  const fmt = (iso: string) => {
    const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'ja' ? 'ja-JP' : 'zh-TW'
    return new Date(iso).toLocaleString(locale, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{t('logs.title')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{t('logs.subtitle', { count: filtered.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors">
            <option value="">{t('logs.filterAllRooms')}</option>
            {rooms.map(r => <option key={r.room_id} value={r.room_id}>{r.name}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors">
            <option value="">{t('logs.filterAllTypes')}</option>
            <option value="checkin">{t('logs.filterCheckin')}</option>
            <option value="checkout">{t('logs.filterCheckout')}</option>
          </select>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>}

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {[t('logs.colId'), t('logs.colUser'), t('logs.colRoom'), t('logs.colType'), t('logs.colTime')].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filtered.map(e => (
              <tr key={e.event_id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-5 py-3.5"><code className="text-xs text-slate-500">{e.event_id}</code></td>
                <td className="px-5 py-3.5 font-medium text-white">{e.user_name ?? e.user_id}</td>
                <td className="px-5 py-3.5 text-slate-300">{e.room_name ?? `Room ${e.room_id}`}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${e.event_type === 'checkin' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                    {e.event_type === 'checkin' ? t('common.checkin') : t('common.checkout')}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs tabular-nums">{fmt(e.timestamp)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500 text-sm">{t('logs.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
