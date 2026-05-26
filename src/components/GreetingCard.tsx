import { forwardRef } from 'react'
import { GiSheep } from 'react-icons/gi'
import { FiMoon } from 'react-icons/fi'

interface Props {
  photo: string | null
  name: string
  style: string
}

const GreetingCard = forwardRef<HTMLDivElement, Props>(({ photo, name, style }, ref) => (
  <div className={`container card-container style-${style}`} ref={ref}>
    <div className="card-glow" />

    <div className="bottom-ornament">
      <span className="moon"><FiMoon /></span>
      <span className="ornament-text">عيد مبارك</span>
      <span className="moon"><FiMoon /></span>
    </div>

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

    <div className="takbeer-wrap">
      <p className="takbeer">الله أكبر الله أكبر لا إله إلا الله والله أكبر الله أكبر ولله الحمد</p>
    </div>

    <h1 className="main-title">
      <span className="title-line accent">عيد أضحى مبارك</span>
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
      <p>لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ</p>
      <p>تقبل الله منا ومنكم صالح الأعمال والأضاحي</p>
    </div>

  </div>
))

GreetingCard.displayName = 'GreetingCard'
export default GreetingCard
