import { FiVolume2, FiVolumeX, FiSend, FiDownload, FiEdit3 } from 'react-icons/fi'

interface Props {
  takbeerOn: boolean
  creatingVideo: boolean
  onToggleTakbeer: () => void
  onShare: () => void
  onDownload: () => void
  onEdit: () => void
}

export default function ActionButtons({
  takbeerOn, creatingVideo,
  onToggleTakbeer, onShare, onDownload, onEdit,
}: Props) {
  return (
    <div className="actions">
      <button className="action-btn takbeer-btn" onClick={onToggleTakbeer}>
        {takbeerOn ? <FiVolume2 /> : <FiVolumeX />}
        التكبيرات
      </button>
      <button className="action-btn share-btn" onClick={onShare} disabled={creatingVideo}>
        <FiSend className={creatingVideo ? 'spinner' : ''} /> {creatingVideo ? 'جاري التجهيز...' : 'معايدة'}
      </button>
      <button className="action-btn png-btn" onClick={onDownload}>
        <FiDownload /> تحميل الصورة
      </button>
      <button className="action-btn back-btn" onClick={onEdit}>
        <FiEdit3 /> تعديل
      </button>
    </div>
  )
}
