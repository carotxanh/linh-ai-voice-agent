export default function Waveform({ className = '' }) {
  return (
    <div className={`waveform ${className}`} aria-hidden="true">
      {Array.from({ length: 18 }).map((_, index) => (
        <span key={index} style={{ '--i': index }} />
      ))}
    </div>
  )
}
