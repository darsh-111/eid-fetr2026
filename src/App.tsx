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
    // Try high-quality SVG scaling (native 3x rendering via <g transform>)
    try {
      const svgDataUri = await Promise.race([
        domtoimage.toSvg(node),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ])
      const raw = decodeURIComponent(svgDataUri.split(',')[1])
      const inner = raw.match(/<foreignObject[^>]*>([\s\S]*)<\/foreignObject>/i)?.[1] || raw
      const w = parseFloat(raw.match(/width="([\d.]+)"/)?.[1] || '800')
      const h = parseFloat(raw.match(/height="([\d.]+)"/)?.[1] || '600')
      const scale = 3
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * scale}" height="${h * scale}"><g transform="scale(${scale})"><foreignObject width="${w}" height="${h}">${inner}</foreignObject></g></svg>`
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      return await new Promise<Blob>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          canvas.getContext('2d')!.drawImage(img, 0, 0)
          URL.revokeObjectURL(url)
          canvas.toBlob(b => b ? resolve(b) : reject(), 'image/png')
        }
        img.onerror = () => { URL.revokeObjectURL(url); reject() }
        img.src = url
      })
    } catch {
      return domtoimage.toBlob(node, { pixelRatio: 3 })
    }
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
    let blob: Blob | null = null
    try {
      blob = await captureBlob()
    } catch {
      setCreatingVideo(false)
      return
    }
    try {
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
      }
    } catch {
      // share cancelled or failed — do nothing
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
