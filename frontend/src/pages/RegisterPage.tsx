import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import { QrCode, Lock, User, Mail, Eye, EyeOff } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!userId.trim() || !name.trim() || !email.trim() || !password || !confirmPw) {
      setError(t('register.errEmpty')); return
    }
    if (password.length < 6) {
      setError(t('register.errPwLen')); return
    }
    if (password !== confirmPw) {
      setError(t('register.errPwMatch')); return
    }
    setLoading(true)
    try {
      await api.register(userId.trim(), name.trim(), email.trim(), password)
      navigate('/login', { state: { registered: true, userId: userId.trim() } })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('register.errFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-teal-900/10 pointer-events-none" />

      <div className="fixed top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-900/40">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('register.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('register.subtitle')}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* User ID */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('register.userId')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={userId} onChange={e => setUserId(e.target.value)}
                  placeholder={t('register.userIdPh')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  autoComplete="username" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('register.name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder={t('register.namePh')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  autoComplete="name" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('register.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t('register.emailPh')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('register.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={t('register.passwordPh')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('register.confirmPw')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder={t('register.confirmPwPh')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  autoComplete="new-password" />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm mt-2">
              {loading ? t('register.submitting') : t('register.submit')}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {t('register.haveAccount')}{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              {t('register.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
