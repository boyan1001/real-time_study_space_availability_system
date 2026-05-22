import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhTW from './locales/zh-TW'
import en from './locales/en'
import ja from './locales/ja'

const LANG_KEY = 'qr_door_lang'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      en: { translation: en },
      ja: { translation: ja },
    },
    lng: localStorage.getItem(LANG_KEY) ?? 'zh-TW',
    fallbackLng: 'zh-TW',
    interpolation: { escapeValue: false },
  })

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANG_KEY, lng)
})

export default i18n
