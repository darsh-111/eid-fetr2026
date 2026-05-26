import { useState, useRef, useEffect, useCallback } from 'react'
import { toPng } from 'dom-to-image-more'
import { ensureFFmpeg, themes } from './constants'
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
        await navigator.share({ title: 'عيد أضحى مبارك', files: [videoFile] })
      } else {
        const url = URL.createObjectURL(new Blob([raw.buffer as ArrayBuffer], { type: 'video/mp4' }))
        const link = document.createElement('a')
        link.download = 'Eid-Ala-Habaybek.mp4'
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      const dataUrl = await toPng(cardRef.current!, {
        quality: 1,
        width: cardRef.current!.scrollWidth,
        height: cardRef.current!.scrollHeight,
      })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'Eid-Ala-Habaybek.png', { type: 'image/png' })
      const shareText = 'كل عام وأنتم بخير\n\nتقبل الله منا ومنكم صالح الأعمال\n\nللاستماع إلى التكبيرات:\nhttps://archive.org/details/EidTakbirBySheikhAliMullah'
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'عيد أضحى مبارك', text: shareText, files: [file] })
      } else if (navigator.share) {
        await navigator.share({ title: 'عيد أضحى مبارك', text: shareText })
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
            onShare={shareVideo}
            onDownload={downloadPNG}
            onEdit={() => setShowCard(false)}
          />
        </>
      )}
    </div>
  )
}

export default App
