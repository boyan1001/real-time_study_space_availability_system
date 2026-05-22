import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, DoorOpen, Users, FileText, LogOut, QrCode, RefreshCw } from 'lucide-react'
import LanguageSwitcher from '../../components/LanguageSwitcher'

export default function AdminLayout() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)
  const [updatedAt, setUpdatedAt] = useState(() => new Date())

  const refresh = () => { setRefreshKey(k => k + 1); setUpdatedAt(new Date()) }

  const timeLocale = i18n.language === 'en' ? 'en-US' : i18n.language === 'ja' ? 'ja-JP' : 'zh-TW'

  const NAV = [
    { to: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/admin/rooms', label: t('nav.rooms'), icon: DoorOpen, end: false },
    { to: '/admin/users', label: t('nav.users'), icon: Users, end: false },
    { to: '/admin/logs', label: t('nav.logs'), icon: FileText, end: false },
  ]

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-white truncate">{t('app.name')}</span>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-sm font-bold flex-shrink-0 text-white">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-slate-500">{t('admin.role')}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 flex-shrink-0 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-5">
          <LanguageSwitcher />
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {t('admin.updatedAt', { time: updatedAt.toLocaleTimeString(timeLocale) })}
            </span>
            <button onClick={refresh}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet key={refreshKey} />
        </main>
      </div>
    </div>
  )
}
