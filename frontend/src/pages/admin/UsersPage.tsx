import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../api'
import type { User } from '../../types'
import { Loader2, MapPin } from 'lucide-react'

export default function UsersPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await api.admin.users()
      setUsers(data.users); setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load(); const timer = setInterval(load, 30_000); return () => clearInterval(timer) }, [load])

  const online = users.filter(u => u.location !== 'unknown')

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">{t('users.title')}</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {t('users.subtitle', { total: users.length })}
          {' · '}
          <span className="text-green-400">{t('users.online', { online: online.length })}</span>
        </p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>}

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {[t('users.colId'), t('users.colName'), t('users.colEmail'), t('users.colRole'), t('users.colLocation')].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map(u => (
              <tr key={u.user_id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-5 py-3.5"><code className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-300">{u.user_id}</code></td>
                <td className="px-5 py-3.5 font-medium text-white">{u.name}</td>
                <td className="px-5 py-3.5 text-slate-400 text-sm">{u.email ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.privileges === 'admin' ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                    {u.privileges === 'admin' ? t('common.admin') : t('common.user')}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {u.location !== 'unknown' ? (
                    <div className="flex items-center gap-1.5 text-sm text-teal-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {u.location}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-sm">{t('users.notInRoom')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
