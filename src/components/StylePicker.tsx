import { styles, themes } from '../constants'

interface Props {
  current: string
  currentTheme: string
  onChange: (id: string) => void
}

export default function StylePicker({ current, currentTheme, onChange }: Props) {
  return (
    <div className="style-picker">
      {styles.map((s) => {
        const isSuggested = themes.find(t => t.id === currentTheme)?.suggestedStyles.includes(s.id)
        return (
          <button
            key={s.id}
            className={`style-option ${current === s.id ? 'active' : ''} ${isSuggested ? 'suggested' : ''}`}
            onClick={() => onChange(s.id)}
          >
            <span className="style-icon">{s.icon}</span>
            <span className="style-label">{s.label}</span>
            {isSuggested && <span className="suggested-badge">مقترح</span>}
          </button>
        )
      })}
    </div>
  )
}
