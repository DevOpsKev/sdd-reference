import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  const motionStatus = document.getElementById('motion-status')
  if (motionStatus) {
    motionStatus.textContent = prefersReducedMotion
      ? 'Reduced motion is ENABLED (transitions disabled)'
      : 'Reduced motion is disabled (transitions active)'
    motionStatus.style.color = prefersReducedMotion
      ? 'var(--ring-assess-fill)'
      : 'var(--ink-muted)'
  }

  const trigger = document.getElementById('motion-trigger')
  const box = document.getElementById('motion-box')
  trigger?.addEventListener('click', () => {
    if (prefersReducedMotion || !box) return
    box.classList.toggle('motion-box-shifted')
  })
})
