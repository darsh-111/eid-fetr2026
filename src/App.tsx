import { useState, useRef, useEffect, useCallback } from 'react'
import domtoimage from 'dom-to-image-more'
import { themes } from './constants'
import StarsBackground from './components/StarsBackground'
import SetupForm from './components/SetupForm'
import GreetingCard from './components/GreetingCard'
import ThemePicker from './components/ThemePicker'
import StylePicker from './components/StylePicker'
import ActionButtons from './components/ActionButtons'
import './App.css'

function App() {
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [showCard, setShowCard] = useState(false)
  const [takbeerOn, setTakbeerOn] = useState(false)
  const [creatingVideo, setCreatingVideo] = useState(false)
  const [count, setCount] = useState<number | null>(null)
  const [theme, setTheme] = useState('gold')
  const [style, setStyle] = useState('classic')

  const handleThemeChange = (id: string) => {
    setTheme(id)
    const t = themes.find(th => th.id === id)
    if (t) setStyle(t.suggestedStyles[0])
  }

  const cardRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    document.body.className = Array.from(document.body.classList)
      .filter(c => !c.startsWith('theme-')).join(' ')
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  useEffect(() => {
    fetch('https://countapi.mileshilliard.com/api/v1/get/eid-adha-2026')
      .then(r => r.json())
      .then(d => setCount(d.value))
      .catch(() => setCount(0))
  }, [])

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
    fetch('https://countapi.mileshilliard.com/api/v1/hit/eid-adha-2026')
      .then(r => r.json())
      .then(d => setCount(d.value))
      .catch(() => {})
  }

  async function captureBlob(): Promise<Blob> {
    const node = cardRef.current!
    const scale = 4

    const svgDataUrl = await domtoimage.toSvg(node)

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = svgDataUrl
    })

    const w = img.naturalWidth
    const h = img.naturalHeight
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    return new Promise<Blob>(r => canvas.toBlob(b => r(b!), 'image/png'))
  }

  const downloadPNG = async () => {
    if (!cardRef.current) return
    const blob = await captureBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'Eid-Ala-Habaybek.png'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const shareCard = async () => {
    if (!cardRef.current) return
    setCreatingVideo(true)
    try {
      const blob = await captureBlob()
      const file = new File([blob], 'Eid-Ala-Habaybek.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'عيد أضحى مبارك',
          text: 'تقبل الله منا ومنكم صالح الأعمال',
          files: [file],
        })
      } else if (navigator.share) {
        await navigator.share({
          title: 'عيد أضحى مبارك',
          text: 'تقبل الله منا ومنكم صالح الأعمال',
        })
      } else {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = 'Eid-Ala-Habaybek.png'
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      const blob = await captureBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'Eid-Ala-Habaybek.png'
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setCreatingVideo(false)
    }
  }

  return (
    <div className={`app-root theme-${theme}`}>
      <StarsBackground />

      {!showCard ? (
        <SetupForm
          name={name}
          photo={photo}
          theme={theme}
          style={style}
          takbeerOn={takbeerOn}
          count={count}
          onNameChange={setName}
          onPhotoChange={handlePhoto}
          onThemeChange={handleThemeChange}
          onStyleChange={setStyle}
          onToggleTakbeer={toggleTakbeer}
          onGenerate={generateCard}
        />
      ) : (
        <>
          <GreetingCard ref={cardRef} photo={photo} name={name} style={style} />

          <div className="card-customize">
            <div className="card-theme-picker">
              <ThemePicker current={theme} onChange={handleThemeChange} />
            </div>
            <div className="card-style-picker">
              <StylePicker current={style} currentTheme={theme} onChange={setStyle} />
            </div>
          </div>

          <ActionButtons
            takbeerOn={takbeerOn}
            creatingVideo={creatingVideo}
            onToggleTakbeer={toggleTakbeer}
            onShare={shareCard}
            onDownload={downloadPNG}
            onEdit={() => setShowCard(false)}
          />
        </>
      )}
    </div>
  )
}

export default App
