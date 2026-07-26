import React from 'react'
import { useChatStore } from '../../store/chatStore'

export default function LanguageToggle() {
  const { language, setLanguage } = useChatStore()
  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
      className="btn btn-secondary btn-sm"
      title="Toggle language"
    >
      {language === 'en' ? '🇮🇳 ಕನ್ನಡ' : '🇬🇧 English'}
    </button>
  )
}
