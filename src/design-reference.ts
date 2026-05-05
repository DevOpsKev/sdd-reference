import './style.css'

// Motion demo: toggle interaction
document.addEventListener('DOMContentLoaded', () => {
  const motionDemo = document.querySelector('.motion-demo-interactive')
  if (motionDemo) {
    motionDemo.addEventListener('click', () => {
      motionDemo.classList.toggle('active')
    })
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const motionStatus = document.getElementById('motion-status')
  if (motionStatus) {
    motionStatus.textContent = prefersReducedMotion
      ? 'Reduced motion is ENABLED (transitions disabled)'
      : 'Reduced motion is disabled (transitions active)'
    motionStatus.style.color = prefersReducedMotion ? 'var(--ring-assess-fill)' : 'var(--ink-muted)'
  }

  console.log('Design reference initialized')
  console.log('prefers-reduced-motion:', prefersReducedMotion)
})
