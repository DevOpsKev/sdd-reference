import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/layout.css'

// Motion demo with prefers-reduced-motion support
const motionTrigger = document.getElementById('motion-trigger')
const motionBox = document.getElementById('motion-box')

if (motionTrigger && motionBox) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  motionTrigger.addEventListener('click', () => {
    if (prefersReducedMotion) {
      // Instant state change without animation
      motionBox.style.transform = 'translateX(100px)'
      setTimeout(() => {
        motionBox.style.transform = 'translateX(0)'
      }, 100)
    } else {
      // Animated using motion tokens
      motionBox.style.transition = 'transform var(--motion-default) var(--motion-default-curve)'
      motionBox.style.transform = 'translateX(100px)'

      setTimeout(() => {
        motionBox.style.transform = 'translateX(0)'
      }, 400)
    }
  })
}

console.log('Design reference initialized')
