import { useLanguage } from '../../i18n/LanguageContext'

// Compact EN/中文 switch for the sidebar. Shows the language you'll switch TO.
export default function LanguageToggle() {
  const { toggleLang, t, lang } = useLanguage()
  return (
    <button
      type="button"
      className="cg-lang-toggle"
      onClick={toggleLang}
      aria-label={t('lang.label')}
      title={t('lang.label')}
    >
      <span className={lang === 'en' ? 'is-active' : ''}>EN</span>
      <span className="cg-lang-sep">/</span>
      <span className={lang === 'zh' ? 'is-active' : ''}>中</span>
    </button>
  )
}
