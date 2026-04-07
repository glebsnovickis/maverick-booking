'use client'

import { Lang } from '@/lib/i18n'

interface LanguageSwitcherProps {
  lang: Lang
  onChangeLang: (lang: Lang) => void
}

export default function LanguageSwitcher({ lang, onChangeLang }: LanguageSwitcherProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChangeLang('ru')}
        className={`px-3 py-1 rounded-md font-medium transition-colors ${
          lang === 'ru'
            ? 'bg-[#c8a259] text-[#1a1a1a]'
            : 'bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] hover:border-[#c8a259]'
        }`}
      >
        РУ
      </button>
      <button
        onClick={() => onChangeLang('lv')}
        className={`px-3 py-1 rounded-md font-medium transition-colors ${
          lang === 'lv'
            ? 'bg-[#c8a259] text-[#1a1a1a]'
            : 'bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] hover:border-[#c8a259]'
        }`}
      >
        LV
      </button>
    </div>
  )
}
