import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LANGS = [
  { code: 'zh-TW', key: 'zh' },
  { code: 'en',    key: 'en' },
  { code: 'ja',    key: 'ja' },
] as const

interface Props { className?: string }

export default function LanguageSwitcher({ className }: Props) {
  const { t, i18n } = useTranslation()

  return (
    <div className={`flex items-center gap-1 ${className ?? ''}`}>
      <Globe className="w-3.5 h-3.5 text-slate-500 mr-0.5" />
      {LANGS.map(({ code, key }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            i18n.language === code
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t(`lang.${key}`)}
        </button>
      ))}
    </div>
  )
}
