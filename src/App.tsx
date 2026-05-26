import { useState, useRef, useMemo, useCallback } from 'react'
import { toPng } from 'dom-to-image-more'
import { GiSheep } from 'react-icons/gi'
import { FiSun, FiMoon, FiDownload, FiEdit3, FiSend, FiVolume2, FiVolumeX } from 'react-icons/fi'
import './App.css'

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
  const cardRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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

  const shareImage = async () => {
    if (!cardRef.current) return
    const dataUrl = await toPng(cardRef.current, {
      quality: 1,
      width: cardRef.current.scrollWidth,
      height: cardRef.current.scrollHeight,
    })
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], 'Eid-Ala-Habaybek.png', { type: 'image/png' })
    const takbeerLink = 'https://archive.org/details/EidTakbirBySheikhAliMullah'
    const shareText = `✨ عيد فطر مبارك ✨\n\nكل عام وأنتم بخير 🎵\n\nللاستماع إلى التكبيرات:\n${takbeerLink}`

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'عيد فطر مبارك',
        text: shareText,
        files: [file],
      })
    } else if (navigator.share) {
      await navigator.share({
        title: 'عيد فطر مبارك',
        text: shareText,
      })
    } else {
      const link = document.createElement('a')
      link.download = 'Eid-Ala-Habaybek.png'
      link.href = dataUrl
      link.click()
    }
  }

  if (!showCard) {
    return (
      <>
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

          <button
            className="generate-btn"
            onClick={generateCard}
            disabled={!name.trim()}
          >
            عيد على حبايبك
          </button>
        </div>
      </>
    )
  }

  return (
    <>
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

      <div className="container card-container" ref={cardRef}>
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

      <div className="actions">
        <button className="action-btn takbeer-btn" onClick={toggleTakbeer}>
          {takbeerOn ? <FiVolume2 /> : <FiVolumeX />}
          التكبيرات
        </button>
        <button className="action-btn share-btn" onClick={shareImage}>
          <FiSend /> معايدة
        </button>
        <button className="action-btn png-btn" onClick={downloadPNG}>
          <FiDownload /> تحميل الصورة
        </button>
        <button className="action-btn back-btn" onClick={goToForm}>
          <FiEdit3 /> تعديل
        </button>
      </div>
    </>
  )
}

export default App
