import { themes } from '../constants'

interface Props {
  current: string
  onChange: (id: string) => void
}

export default function ThemePicker({ current, onChange }: Props) {
  return (
    <div className="theme-picker">
      {themes.map((t) => (
        <button
          key={t.id}
          className={`theme-swatch ${current === t.id ? 'active' : ''}`}
          style={{ '--swatch': t.color } as React.CSSProperties}
          onClick={() => onChange(t.id)}
          title={t.label}
        />
      ))}
    </div>
  )
}
