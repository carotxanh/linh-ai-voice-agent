import { useCallback, useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import VideoBackground from './components/VideoBackground'
import LoginModal from './components/LoginModal'
import { scenes } from './data/scenes'
import CTAScene from './sections/CTAScene'
import HeroScene from './sections/HeroScene'
import HowItWorksScene from './sections/HowItWorksScene'
import ProblemScene from './sections/ProblemScene'
import SolutionScene from './sections/SolutionScene'
import UseCasesScene from './sections/UseCasesScene'
import './index.css'

const sceneComponents = [HeroScene, ProblemScene, SolutionScene, UseCasesScene, HowItWorksScene, CTAScene]

function App() {
  const sceneRefs = useRef([])
  const activeSceneRef = useRef(0)
  const [activeScene, setActiveScene] = useState(0)
  const [showLogin, setShowLogin] = useState(false)

  const openAuth = () => setShowLogin(true)

  const goToScene = useCallback((nextIndex) => {
    if (nextIndex < 0 || nextIndex >= scenes.length) return

    sceneRefs.current[nextIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  useEffect(() => {
    activeSceneRef.current = activeScene
  }, [activeScene])

  useEffect(() => {
    let frame = 0

    const syncSceneToScroll = () => {
      frame = 0
      const viewportCenter = window.scrollY + window.innerHeight / 2
      let nextScene = 0

      sceneRefs.current.forEach((section, index) => {
        if (!section) return
        if (section.offsetTop <= viewportCenter) {
          nextScene = index
        }
      })

      if (nextScene === activeSceneRef.current) return

      activeSceneRef.current = nextScene
      setActiveScene(nextScene)
    }

    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(syncSceneToScroll)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    syncSceneToScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      className="cinema-app"
      style={{
        '--scene-index': activeScene,
        '--scene-direction': 1,
      }}
    >
      <VideoBackground mood={scenes[activeScene].mood} sceneIndex={activeScene} />

      <Navbar activeScene={activeScene} onNavigate={goToScene} onCta={openAuth} />

      <main className="scene-canvas">
        {sceneComponents.map((SceneComponent, index) => (
          <div
            key={scenes[index].id}
            ref={(node) => {
              sceneRefs.current[index] = node
            }}
            className="scene-page"
          >
            <SceneComponent onCta={openAuth} />
          </div>
        ))}
      </main>

      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}

export default App
