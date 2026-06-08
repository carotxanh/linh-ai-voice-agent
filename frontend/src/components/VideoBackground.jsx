export default function VideoBackground() {
  return (
    <div className="video-stage">
      <video
        className="live-wallpaper-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/videos/lost-space.3840x2160.mp4" type="video/mp4" />
      </video>
      <div className="video-dark-overlay" />
      <div className="video-gradient-overlay" />
    </div>
  )
}
