import { useMemo } from 'react'
import { FiSun } from 'react-icons/fi'
import { seededRandom } from '../constants'

export default function StarsBackground() {
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
    </>
  )
}
