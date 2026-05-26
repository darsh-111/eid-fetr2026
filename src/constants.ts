import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

export const themes = [
  { id: 'gold', label: 'ذهبي', color: '#D4AF37', suggestedStyles: ['classic', 'elegant'] },
  { id: 'emerald', label: 'زمردي', color: '#58D68D', suggestedStyles: ['moroccan', 'luxury'] },
  { id: 'coral', label: 'مرجاني', color: '#FF7979', suggestedStyles: ['elegant', 'minimal'] },
  { id: 'lavender', label: 'لافاندي', color: '#A29BFE', suggestedStyles: ['minimal', 'classic'] },
  { id: 'honey', label: 'عسلي', color: '#F6B93B', suggestedStyles: ['classic', 'moroccan'] },
  { id: 'mint', label: 'نعناعي', color: '#48C9B0', suggestedStyles: ['elegant', 'luxury'] },
]

export const styles = [
  { id: 'classic', label: 'كلاسيك', icon: '◇' },
  { id: 'elegant', label: 'أنيق', icon: '◦' },
  { id: 'luxury', label: 'فاخر', icon: '✦' },
  { id: 'minimal', label: 'بسيط', icon: '○' },
  { id: 'moroccan', label: 'موريكي', icon: '⭒' },
]

let ffmpegInstance: FFmpeg | null = null
let ffmpegReady = false

export async function ensureFFmpeg() {
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

export function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}
