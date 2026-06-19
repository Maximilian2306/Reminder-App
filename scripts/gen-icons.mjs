import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const r = size * 0.22
  const cx = size / 2
  const cy = size / 2

  // Background
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#6366f1')
  grad.addColorStop(1, '#8b5cf6')
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, r)
  ctx.fillStyle = grad
  ctx.fill()

  // Circle
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = size * 0.065
  ctx.stroke()

  // Checkmark
  const s = size * 0.14
  ctx.beginPath()
  ctx.moveTo(cx - s, cy)
  ctx.lineTo(cx - s * 0.25, cy + s * 0.8)
  ctx.lineTo(cx + s * 1.1, cy - s * 0.8)
  ctx.strokeStyle = 'white'
  ctx.lineWidth = size * 0.065
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()

  return canvas.toBuffer('image/png')
}

for (const size of [192, 512]) {
  const buf = drawIcon(size)
  const path = join(outDir, `icon-${size}.png`)
  writeFileSync(path, buf)
  console.log(`Generated ${path}`)
}
