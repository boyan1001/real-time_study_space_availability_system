import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../../api'
import type { Room } from '../../types'
import { Plus, Trash2, QrCode, ExternalLink, X, Loader2 } from 'lucide-react'

interface QRModalProps { room: Room; onClose: () => void; onSimulate: () => void }

function QRModal({ room, onClose, onSimulate }: QRModalProps) {
  const { t } = useTranslation()
  const url = `${window.location.origin}/access/${room.room_id}`
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h3 className="font-semibold text-white">{t('rooms.qrModalTitle', { name: room.name })}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-lg">
            <QRCodeSVG value={url} size={180} bgColor="#ffffff" fgColor="#0f172a" level="M" />
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 break-all">{url}</p>
            <p className="text-xs text-slate-400 mt-2">{t('rooms.qrDesc')}</p>
          </div>
          <div className="w-full border-t border-slate-700 pt-4">
            <button onClick={onSimulate}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
              <ExternalLink className="w-4 h-4" />
              {t('rooms.qrSimulate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AddRoomForm { room_id: string; name: string; capacity: string }

export default function RoomsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<AddRoomForm>({ room_id: '', name: '', capacity: '' })
  const [formErr, setFormErr] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await api.admin.rooms()
      setRooms(data.rooms); setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const handleDelete = async (roomId: number, name: string) => {
    if (!confirm(t('rooms.confirmDelete', { name }))) return
    try { await api.admin.deleteRoom(roomId); await load() }
    catch (err: unknown) { alert(err instanceof Error ? err.message : t('rooms.errDelete')) }
  }

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault(); setFormErr('')
    const rid = parseInt(form.room_id), cap = parseInt(form.capacity)
    if (!rid || !form.name.trim() || !cap) { setFormErr(t('rooms.errEmpty')); return }
    setFormLoading(true)
    try {
      await api.admin.createRoom(rid, { name: form.name.trim(), capacity: cap, current_occupancy: 0, status: 'available' })
      setShowAdd(false); setForm({ room_id: '', name: '', capacity: '' }); await load()
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : t('rooms.errCreate'))
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{t('rooms.title')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{t('rooms.subtitle', { count: rooms.length })}</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" /> {t('rooms.addBtn')}
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>}

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {[t('rooms.colId'), t('rooms.colName'), t('rooms.colCapacity'), t('rooms.colOccupancy'), t('rooms.colStatus'), t('rooms.colActions')].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {rooms.map(r => (
              <tr key={r.room_id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-5 py-3.5"><code className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-300">{r.room_id}</code></td>
                <td className="px-5 py-3.5 font-medium text-white">{r.name}</td>
                <td className="px-5 py-3.5 text-slate-300">{r.capacity}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{r.current_occupancy}</span>
                    <div className="flex-1 max-w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.capacity ? (r.current_occupancy / r.capacity) * 100 : 0}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.status === 'occupied' ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'}`}>
                    {r.status === 'occupied' ? t('common.occupied') : t('common.available')}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedRoom(r)}
                      className="flex items-center gap-1.5 bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                      <QrCode className="w-3.5 h-3.5" /> {t('rooms.btnQR')}
                    </button>
                    <button onClick={() => handleDelete(r.room_id, r.name)}
                      className="p-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">{t('rooms.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRoom && (
        <QRModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSimulate={() => { setSelectedRoom(null); navigate(`/access/${selectedRoom.room_id}`) }}
        />
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h3 className="font-semibold text-white">{t('rooms.addTitle')}</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="p-5 space-y-4">
              {[
                { label: t('rooms.addIdLabel'), key: 'room_id', ph: t('rooms.addIdPh'), type: 'number' },
                { label: t('rooms.addNameLabel'), key: 'name', ph: t('rooms.addNamePh'), type: 'text' },
                { label: t('rooms.addCapLabel'), key: 'capacity', ph: t('rooms.addCapPh'), type: 'number' },
              ].map(({ label, key, ph, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                  <input type={type} value={form[key as keyof AddRoomForm]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={ph}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              ))}
              {formErr && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{formErr}</p>}
              <button type="submit" disabled={formLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                {formLoading ? t('rooms.addSubmitting') : t('rooms.addSubmit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
