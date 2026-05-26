import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { toPng } from 'dom-to-image-more'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { GiSheep } from 'react-icons/gi'
import { FiSun, FiMoon, FiDownload, FiEdit3, FiSend, FiVolume2, FiVolumeX } from 'react-icons/fi'
import './App.css'

const themes = [
  { id: 'gold', label: 'ذهبي', color: '#D4AF37' },
  { id: 'emerald', label: 'زمردي', color: '#58D68D' },
  { id: 'coral', label: 'مرجاني', color: '#FF7979' },
  { id: 'lavender', label: 'لافاندي', color: '#A29BFE' },
  { id: 'honey', label: 'عسلي', color: '#F6B93B' },
  { id: 'mint', label: 'نعناعي', color: '#48C9B0' },
]

const styles = [
  { id: 'classic', label: 'كلاسيك', icon: '◇' },
  { id: 'elegant', label: 'أنيق', icon: '◦' },
  { id: 'luxury', label: 'فاخر', icon: '✦' },
  { id: 'minimal', label: 'بسيط', icon: '○' },
  { id: 'moroccan', label: 'موريكي', icon: '⭒' },
]

let ffmpegInstance: FFmpeg | null = null
let ffmpegReady = false

async function ensureFFmpeg() {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg()
  }
  if (!ffmpegReady) {
    const base = '/@ffmpeg/core'
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    ffmpegReady = true
  }
  return ffmpegInstance!
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function App() {
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [showCard, setShowCard] = useState(false)
  const [takbeerOn, setTakbeerOn] = useState(false)
  const [creatingVideo, setCreatingVideo] = useState(false)
  const [theme, setTheme] = useState('gold')
  const [style, setStyle] = useState('classic')
  const cardRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    document.body.className = Array.from(document.body.classList)
      .filter(c => !c.startsWith('theme-')).join(' ')
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  const toggleTakbeer = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://archive.org/download/EidTakbirBySheikhAliMullah/EidTakbirBySheikhAliMullah.mp3')
      audioRef.current.loop = true
    }
    if (takbeerOn) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setTakbeerOn(!takbeerOn)
  }, [takbeerOn])

  const stars = useMemo(() => {
    const rng = seededRandom(42)
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${rng() * 100}%`,
      top: `${rng() * 100}%`,
      size: `${rng() * 3 + 1}px`,
      delay: `${rng() * 3}s`,
    }))
  }, [])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const generateCard = () => {
    if (!name.trim()) return
    setShowCard(true)
  }

  const downloadPNG = async () => {
    if (!cardRef.current) return
    const dataUrl = await toPng(cardRef.current, {
      quality: 1,
      width: cardRef.current.scrollWidth,
      height: cardRef.current.scrollHeight,
    })
    const link = document.createElement('a')
    link.download = 'Eid-Ala-Habaybek.png'
    link.href = dataUrl
    link.click()
  }

  const goToForm = () => {
    setShowCard(false)
  }

  const shareVideo = async () => {
    if (!cardRef.current) return
    setCreatingVideo(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        width: cardRef.current.scrollWidth,
        height: cardRef.current.scrollHeight,
      })
      const pngBlob = await (await fetch(dataUrl)).blob()
      const ff = await ensureFFmpeg()
      await ff.writeFile('input.png', new Uint8Array(await pngBlob.arrayBuffer()))
      const audioRes = await fetch('https://archive.org/download/EidTakbirBySheikhAliMullah/EidTakbirBySheikhAliMullah.mp3')
      await ff.writeFile('audio.mp3', new Uint8Array(await audioRes.arrayBuffer()))
      await ff.exec([
        '-loop', '1',
        '-i', 'input.png',
        '-i', 'audio.mp3',
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-shortest',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        'output.mp4',
      ])
      const data = await ff.readFile('output.mp4')
      const raw = data as Uint8Array
      const videoFile = new File([raw.buffer as ArrayBuffer], 'Eid-Ala-Habaybek.mp4', { type: 'video/mp4' })
      if (navigator.share && navigator.canShare?.({ files: [videoFile] })) {
        await navigator.share({
          title: 'عيد فطر مبارك',
          files: [videoFile],
        })
      } else {
        const url = URL.createObjectURL(new Blob([raw.buffer as ArrayBuffer], { type: 'video/mp4' }))
        const link = document.createElement('a')
        link.download = 'Eid-Ala-Habaybek.mp4'
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        width: cardRef.current.scrollWidth,
        height: cardRef.current.scrollHeight,
      })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'Eid-Ala-Habaybek.png', { type: 'image/png' })
      const shareText = '✨ عيد فطر مبارك ✨\n\nكل عام وأنتم بخير 🎵\n\nللاستماع إلى التكبيرات:\nhttps://archive.org/details/EidTakbirBySheikhAliMullah'
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'عيد فطر مبارك', text: shareText, files: [file] })
      } else if (navigator.share) {
        await navigator.share({ title: 'عيد فطر مبارك', text: shareText })
      } else {
        const link = document.createElement('a')
        link.download = 'Eid-Ala-Habaybek.png'
        link.href = dataUrl
        link.click()
      }
    } finally {
      setCreatingVideo(false)
    }
  }

  if (!showCard) {
    return (
      <div className={`app-root theme-${theme}`}>
        <div className="stars">
          {stars.map((s) => (
            <div
              key={s.id}
              className="star"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>
        <div className="pattern-overlay" />
        <div className="lantern"><FiSun /></div>
        <div className="lantern"><FiSun /></div>
        <div className="lantern"><FiSun /></div>
        <div className="lantern"><FiSun /></div>

        <div className="container form-container">
          <div className="sheep-logo"><GiSheep /></div>
          <h1 className="form-title">عيد فطر مبارك</h1>
          <p className="form-subtitle">اصنع بطاقة المعايدة الخاصة بك</p>

          <button className="takbeer-toggle" onClick={toggleTakbeer}>
            {takbeerOn ? <FiVolume2 /> : <FiVolumeX />}
            التكبيرات
          </button>

          <div className="form-group">
            <label htmlFor="name">الاسم</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              onChange={handlePhoto}
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
            <div className="theme-picker">
              {themes.map((t) => (
                <button
                  key={t.id}
                  className={`theme-swatch ${theme === t.id ? 'active' : ''}`}
                  style={{ '--swatch': t.color } as React.CSSProperties}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          <div className="customize-section">
            <label>التصميم</label>
            <div className="style-picker">
              {styles.map((s) => (
                <button
                  key={s.id}
                  className={`style-option ${style === s.id ? 'active' : ''}`}
                  onClick={() => setStyle(s.id)}
                >
                  <span className="style-icon">{s.icon}</span>
                  <span className="style-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="generate-btn"
            onClick={generateCard}
            disabled={!name.trim()}
          >
            عيد على حبايبك
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`app-root theme-${theme}`}>
      <div className="stars">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
      <div className="pattern-overlay" />
      <div className="lantern"><FiSun /></div>
      <div className="lantern"><FiSun /></div>
      <div className="lantern"><FiSun /></div>
      <div className="lantern"><FiSun /></div>

      <div className={`container card-container style-${style}`} ref={cardRef}>
        <div className="border-ornament top-ornament">
          <span className="diamond">◆</span>
          <span className="ornament-line" />
          <span className="diamond">◇</span>
          <span className="ornament-line" />
          <span className="diamond">◆</span>
        </div>

        <div className="sheep-logo card-sheep"><GiSheep /></div>

        <div className="user-section">
          {photo && (
            <div className="user-photo">
              <img src={photo} alt={name} />
            </div>
          )}
          <p className="user-name">{name}</p>
        </div>

        <p className="takbeer">الله أكبر الله أكبر لا إله إلا الله والله أكبر الله أكبر ولله الحمد</p>

        <h1 className="main-title">
          <span className="title-line accent">عيد فطر مبارك</span>
        </h1>

        <div className="decorative-line">
          <span className="dot">●</span>
          <span className="line" />
          <span className="dot">◉</span>
          <span className="line" />
          <span className="dot">●</span>
        </div>

        <p className="blessing">
          تقبل الله منا ومنكم صالح الأعمال
          <br />
          وكل عام وأنتم إلى الله أقرب
        </p>

        <div className="dua">
          <p>اللهم اجعلنا من عتقائك من النار</p>
          <p>واجعل هذا العيد عيد سعادة وبركة علينا</p>
        </div>

        <div className="bottom-ornament">
          <span className="moon"><FiMoon /></span>
          <span className="ornament-text">عيد مبارك</span>
          <span className="moon"><FiMoon /></span>
        </div>
      </div>

      <div className="card-customize">
        <div className="card-theme-picker">
          {themes.map((t) => (
            <button
              key={t.id}
              className={`theme-swatch ${theme === t.id ? 'active' : ''}`}
              style={{ '--swatch': t.color } as React.CSSProperties}
              onClick={() => setTheme(t.id)}
              title={t.label}
            />
          ))}
        </div>
        <div className="card-style-picker">
          {styles.map((s) => (
            <button
              key={s.id}
              className={`style-option ${style === s.id ? 'active' : ''}`}
              onClick={() => setStyle(s.id)}
            >
              <span className="style-icon">{s.icon}</span>
              <span className="style-label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="actions">
        <button className="action-btn takbeer-btn" onClick={toggleTakbeer}>
          {takbeerOn ? <FiVolume2 /> : <FiVolumeX />}
          التكبيرات
        </button>
        <button className="action-btn share-btn" onClick={shareVideo} disabled={creatingVideo}>
          <FiSend className={creatingVideo ? 'spinner' : ''} /> {creatingVideo ? 'جاري التجهيز...' : 'معايدة'}
        </button>
        <button className="action-btn png-btn" onClick={downloadPNG}>
          <FiDownload /> تحميل الصورة
        </button>
        <button className="action-btn back-btn" onClick={goToForm}>
          <FiEdit3 /> تعديل
        </button>
      </div>
    </div>
  )
}

export default App
