import { GiSheep } from 'react-icons/gi'
import { FiVolume2, FiVolumeX, FiUsers } from 'react-icons/fi'
import ThemePicker from './ThemePicker'
import StylePicker from './StylePicker'

interface Props {
  name: string
  photo: string | null
  theme: string
  style: string
  takbeerOn: boolean
  count: number | null
  onNameChange: (v: string) => void
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onThemeChange: (id: string) => void
  onStyleChange: (id: string) => void
  onToggleTakbeer: () => void
  onGenerate: () => void
}

export default function SetupForm({
  name, photo, theme, style, takbeerOn, count,
  onNameChange, onPhotoChange, onThemeChange, onStyleChange,
  onToggleTakbeer, onGenerate,
}: Props) {
  return (
    <div className="container form-container">
      <div className="sheep-logo"><GiSheep /></div>
      <h1 className="form-title">عيد أضحى مبارك</h1>
      <p className="form-subtitle">اصنع بطاقة المعايدة الخاصة بك</p>

      <button className="takbeer-toggle" onClick={onToggleTakbeer}>
        {takbeerOn ? <FiVolume2 /> : <FiVolumeX />}
        التكبيرات
      </button>

      <div className="form-group">
        <label htmlFor="name">الاسم</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="اكتب اسمك..."
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="photo">صورتك</label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          onChange={onPhotoChange}
          className="form-input file-input"
        />
        {photo && (
          <div className="photo-preview">
            <img src={photo} alt="preview" />
          </div>
        )}
      </div>

      <div className="customize-section">
        <label>اللون</label>
        <ThemePicker current={theme} onChange={onThemeChange} />
      </div>

      <div className="customize-section">
        <label>التصميم</label>
        <StylePicker current={style} currentTheme={theme} onChange={onStyleChange} />
      </div>

      <button className="generate-btn" onClick={onGenerate} disabled={!name.trim()}>
        عيد على حبايبك
      </button>

      {count !== null && (
        <p className="visit-count"><FiUsers size={16} /> {count} بطاقة معايدة</p>
      )}
    </div>
  )
}
