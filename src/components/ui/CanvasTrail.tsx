import { useEffect, useRef } from 'react'

const E = {
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
}

// Brand blue: #0B42A7 → hsl(220, 87%, 35%)
const BLUE_HUE = 220
const BLUE_SAT = 87
const BLUE_LIT = 55

class Node {
  x = 0; y = 0; vx = 0; vy = 0
}

class Line {
  spring: number; friction: number; nodes: Node[]
  constructor(spring: number) {
    this.spring = spring + 0.1 * Math.random() - 0.05
    this.friction = E.friction + 0.01 * Math.random() - 0.005
    this.nodes = Array.from({ length: E.size }, () => new Node())
  }
  update(pos: { x: number; y: number }) {
    let s = this.spring
    const head = this.nodes[0]
    head.vx += (pos.x - head.x) * s
    head.vy += (pos.y - head.y) * s
    for (let i = 0; i < this.nodes.length; i++) {
      const t = this.nodes[i]
      if (i > 0) {
        const n = this.nodes[i - 1]
        t.vx += (n.x - t.x) * s
        t.vy += (n.y - t.y) * s
        t.vx += n.vx * E.dampening
        t.vy += n.vy * E.dampening
      }
      t.vx *= this.friction
      t.vy *= this.friction
      t.x += t.vx
      t.y += t.vy
      s *= E.tension
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    let nx = this.nodes[0].x
    let ny = this.nodes[0].y
    ctx.beginPath()
    ctx.moveTo(nx, ny)
    for (let a = 1; a < this.nodes.length - 2; a++) {
      const e = this.nodes[a]
      const t = this.nodes[a + 1]
      nx = 0.5 * (e.x + t.x)
      ny = 0.5 * (e.y + t.y)
      ctx.quadraticCurveTo(e.x, e.y, nx, ny)
    }
    const last = this.nodes[this.nodes.length - 2]
    const end  = this.nodes[this.nodes.length - 1]
    ctx.quadraticCurveTo(last.x, last.y, end.x, end.y)
    ctx.stroke()
    ctx.closePath()
  }
}

export default function CanvasTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let running = true
    const pos = { x: -1000, y: -1000 }

    function resize() {
      canvas!.width  = canvas!.offsetWidth
      canvas!.height = canvas!.offsetHeight
    }

    const lines: Line[] = Array.from({ length: E.trails }, (_, i) =>
      new Line(0.45 + (i / E.trails) * 0.025)
    )

    function render() {
      if (!running) return
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx.globalCompositeOperation = 'lighter'
      ctx.strokeStyle = `hsla(${BLUE_HUE},${BLUE_SAT}%,${BLUE_LIT}%,0.035)`
      ctx.lineWidth = 10
      for (const line of lines) {
        line.update(pos)
        line.draw(ctx)
      }
      requestAnimationFrame(render)
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      pos.x = e.clientX - rect.left
      pos.y = e.clientY - rect.top
    }

    function onTouch(e: TouchEvent) {
      const rect = canvas!.getBoundingClientRect()
      pos.x = e.touches[0].clientX - rect.left
      pos.y = e.touches[0].clientY - rect.top
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onTouch, { passive: true })
    render()

    return () => {
      running = false
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}
