import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { QrCode, Lock, User, Eye, EyeOff, LayoutGrid, UserPlus, ShieldAlert } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function LoginPage() {
  const { t } = useTranslation()
  const { user, isAdmin, login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? null
  const registered = (location.state as { registered?: boolean; userId?: string } | null)
  const isAdminRoute = from === '/admin'

  const [userId, setUserId] = useState(registered?.userId ?? '')
  const [password, setPassword] = useState('')
  const [adminToken, setAdminToken] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isAdminId = userId.toUpperCase().startsWith('ADM')

  useEffect(() => {
    if (!user) return
    if (from) navigate(from, { replace: true })
    else if (isAdmin) navigate('/admin', { replace: true })
  }, [user, from, isAdmin, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!userId.trim() || !password) { setError(t('login.errEmpty')); return }
    setLoading(true)
    try {
      const loggedUser = await login(userId.trim(), password, isAdminId ? (adminToken || undefined) : undefined)
      if (isAdminRoute && loggedUser.privileges !== 'admin') {
        logout()
        setPassword('')
        setError(t('login.errNotAdmin'))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.errFailed'))
    } finally {
      setLoading(false)
    }
  }

  const fill = (id: string, pw: string) => { setUserId(id); setPassword(pw) }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-teal-900/10 pointer-events-none" />

      {/* Language switcher */}
      <div className="fixed top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-900/40">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('app.name')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('app.subtitle')}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {registered?.registered && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-6 text-sm text-green-400">
              {t('register.success')}
            </div>
          )}
          {isAdminRoute && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-6 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-400">{t('login.adminOnly')}</p>
                <p className="text-xs text-amber-400/70 mt-0.5">{t('login.adminOnlyDesc')}</p>
              </div>
            </div>
          )}
          {!isAdminRoute && !registered?.registered && from && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 mb-6 text-sm text-blue-400">
              {t('login.redirectHint')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('login.userId')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={userId} onChange={e => setUserId(e.target.value)}
                  placeholder={t('login.userIdPh')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  autoComplete="username" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('login.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={t('login.passwordPh')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isAdminId && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  {t('login.adminToken')}
                  <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{t('common.admin')}</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="password" value={adminToken} onChange={e => setAdminToken(e.target.value)}
                    placeholder={t('login.adminTokenPh')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
              {loading ? t('login.submitting') : t('login.submit')}
            </button>
          </form>

          <div className="mt-5 border-t border-slate-700 pt-5 flex items-center justify-center">
            <Link to="/register"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 transition-colors">
              <UserPlus className="w-4 h-4" />
              {t('login.noAccount')}
              <span className="text-blue-400 font-medium">{t('login.registerLink')}</span>
            </Link>
          </div>

          <details className="mt-4 border-t border-slate-700 pt-4">
            <summary className="text-xs text-slate-500 cursor-pointer select-none hover:text-slate-400 transition-colors">
              {t('login.testAccounts')}
            </summary>
            <div className="mt-3 space-y-1.5">
              {[
                { label: t('login.roleAdmin'), id: 'ADM001', pw: 'admin9999' },
                { label: t('login.roleStudent', { n: 1 }), id: 'STU001', pw: 'pass1234' },
                { label: t('login.roleStudent', { n: 2 }), id: 'STU002', pw: 'pass1234' },
                { label: t('login.roleStudent', { n: 3 }), id: 'STU003', pw: 'pass1234' },
              ].map(a => (
                <button key={a.id} type="button" onClick={() => fill(a.id, a.pw)}
                  className="w-full flex items-center gap-3 bg-slate-900 hover:bg-slate-700 rounded-lg px-3 py-2 text-xs transition-colors text-left">
                  <span className="text-slate-400 w-14">{a.label}</span>
                  <code className="text-slate-200">{a.id}</code>
                  <span className="text-slate-600">/</span>
                  <code className="text-slate-400">{a.pw}</code>
                </button>
              ))}
            </div>
          </details>
        </div>

        <div className="mt-5 text-center">
          <Link to="/board" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 transition-colors">
            <LayoutGrid className="w-4 h-4" />
            {t('board.title')} →
          </Link>
        </div>
      </div>
    </div>
  )
}
