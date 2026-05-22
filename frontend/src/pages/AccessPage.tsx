import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import type { Room } from '../types'
import {
  QrCode, Lock, Loader2,
  DoorOpen, DoorClosed, CheckCircle2, XCircle, ArrowLeft, RotateCcw,
} from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

type Step = 'loading' | 'login' | 'confirm' | 'processing' | 'success' | 'error'

export default function AccessPage() {
  const { t } = useTranslation()
  const { roomId } = useParams<{ roomId: string }>()
  const { user, login, isAdmin, updateUserLocation } = useAuth()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Room | null>(null)
  const [step, setStep] = useState<Step>('loading')
  const [action, setAction] = useState<'checkin' | 'checkout'>('checkin')

  const [uid, setUid] = useState('')
  const [pw, setPw] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [resultMsg, setResultMsg] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const executed = useRef(false)

  useEffect(() => {
    if (!roomId) { setErrMsg(t('access.errInvalid')); setStep('error'); return }
    api.getRoom(parseInt(roomId))
      .then(r => setRoom(r))
      .catch(() => { setErrMsg(t('access.errNotFound')); setStep('error') })
  }, [roomId, t])

  useEffect(() => {
    if (!room) return
    if (user) {
      setAction(user.location === `Room ${room.room_id}` ? 'checkout' : 'checkin')
      setStep('confirm')
    } else {
      setStep('login')
    }
  }, [room, user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginErr('')
    if (!uid.trim() || !pw) { setLoginErr(t('access.errLoginEmpty')); return }
    setLoginLoading(true)
    try {
      await login(uid.trim(), pw)
    } catch (err: unknown) {
      setLoginErr(err instanceof Error ? err.message : t('access.errLoginFailed'))
    } finally {
      setLoginLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!room || !user || executed.current) return
    executed.current = true
    setStep('processing')
    try {
      if (action === 'checkin') {
        await api.checkin(room.room_id, user.user_id)
        updateUserLocation(`Room ${room.room_id}`)
        setResultMsg(t('access.successCheckin', { name: user.name, room: room.name }))
      } else {
        await api.checkout(room.room_id, user.user_id)
        updateUserLocation('unknown')
        setResultMsg(t('access.successCheckout', { name: user.name, room: room.name }))
      }
      setStep('success')
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : t('common.error'))
      setStep('error')
    }
  }

  const handleScanAgain = () => {
    executed.current = false
    window.location.reload()
  }

  const isCheckin = action === 'checkin'

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/60 via-slate-900 to-slate-900 pointer-events-none" />

      {/* Language switcher */}
      <div className="fixed top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {isAdmin && step !== 'loading' && (
        <button onClick={() => navigate('/admin/rooms')}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors z-10">
          <ArrowLeft className="w-4 h-4" />
          {t('nav.backToAdmin')}
        </button>
      )}

      <div className="relative w-full max-w-sm z-10">
        {/* Room header */}
        {room && step !== 'error' && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl mb-3">
              <QrCode className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white">{room.name}</h1>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <span className={`w-2 h-2 rounded-full ${room.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className="text-slate-400 text-xs">
                {room.status === 'occupied' ? t('common.occupied') : t('common.available')}
                {' · '}
                {t('access.occupancy', { cur: room.current_occupancy, cap: room.capacity })}
              </span>
            </div>
          </div>
        )}

        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

          {step === 'loading' && (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">{t('access.loading')}</p>
            </div>
          )}

          {step === 'login' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600/20 rounded-xl mb-3">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="font-semibold text-white text-base">{t('access.loginTitle')}</h2>
                <p className="text-slate-400 text-xs mt-1">{t('access.loginSubtitle')}</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('access.userId')}</label>
                  <input type="text" value={uid} onChange={e => setUid(e.target.value)}
                    placeholder={t('access.userIdPh')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    autoComplete="username" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('access.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="password" value={pw} onChange={e => setPw(e.target.value)}
                      placeholder={t('access.passwordPh')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                      autoComplete="current-password" />
                  </div>
                </div>
                {loginErr && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{loginErr}</p>
                )}
                <button type="submit" disabled={loginLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-1">
                  {loginLoading ? t('access.loginSubmitting') : t('access.loginSubmit')}
                </button>
              </form>
            </div>
          )}

          {step === 'confirm' && room && user && (
            <div className="p-6">
              <div className="text-center mb-5">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${isCheckin ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                  {isCheckin
                    ? <DoorOpen className="w-6 h-6 text-green-400" />
                    : <DoorClosed className="w-6 h-6 text-yellow-400" />}
                </div>
                <p className="text-slate-300 text-sm">{t('access.greet', { name: user.name })}</p>
                <p className="text-slate-400 text-xs mt-1">
                  {isCheckin ? t('access.confirmCheckin') : t('access.confirmCheckout')}
                </p>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 mb-5 space-y-2 text-sm">
                {[
                  { label: t('access.infoRoom'), value: room.name, color: '' },
                  { label: t('access.infoAction'), value: isCheckin ? t('common.checkin') : t('common.checkout'), color: isCheckin ? 'text-green-400' : 'text-yellow-400' },
                  { label: t('access.infoOccupancy'), value: t('access.occupancy', { cur: room.current_occupancy, cap: room.capacity }), color: '' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-medium ${color || 'text-slate-200'}`}>{value}</span>
                  </div>
                ))}
              </div>

              <button onClick={handleExecute}
                className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-colors text-white text-base ${isCheckin ? 'bg-green-600 hover:bg-green-500' : 'bg-yellow-600 hover:bg-yellow-500'}`}>
                {isCheckin ? <DoorOpen className="w-5 h-5" /> : <DoorClosed className="w-5 h-5" />}
                {isCheckin ? t('access.actionCheckin') : t('access.actionCheckout')}
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="p-10 text-center">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
              <p className="text-white font-medium">
                {isCheckin ? t('access.processingCheckin') : t('access.processingCheckout')}
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-1">{t('access.successTitle')}</h2>
              <p className="text-slate-400 text-sm mb-6">{resultMsg}</p>
              <div className="space-y-2">
                <button onClick={handleScanAgain}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm transition-colors">
                  <RotateCcw className="w-4 h-4" />
                  {t('access.scanAgain')}
                </button>
                {isAdmin && (
                  <button onClick={() => navigate('/admin/rooms')}
                    className="w-full text-slate-400 hover:text-slate-200 py-2 text-sm transition-colors">
                    {t('access.backToAdmin')}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="p-8 text-center">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-1">{t('access.failTitle')}</h2>
              <p className="text-slate-400 text-sm mb-6">{errMsg}</p>
              <button onClick={() => navigate(-1)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm transition-colors">
                {t('common.back')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
