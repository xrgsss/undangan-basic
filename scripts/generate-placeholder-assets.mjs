/**
 * generate-placeholder-assets.mjs
 * ----------------------------------------------------------------------------
 * Membuat SEMUA aset placeholder yang dipakai undangan, sehingga project bisa
 * langsung dijalankan tanpa perlu mengunduh gambar dari internet:
 *
 *   • public/images/couple/bride.svg, groom.svg   → foto mempelai
 *   • public/images/gallery/gallery-01..09.svg    → sembilan foto galeri
 *   • public/audio/wedding-bgm.wav                → musik latar (synth)
 *   • public/og-image.png                         → gambar pratinjau tautan
 *
 * Jalankan ulang kapan saja:
 *     npm run assets
 *
 * Semua aset ini PLACEHOLDER. Ganti dengan aset asli pasangan — lihat README.md
 * pada bagian "Daftar aset yang harus diganti".
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const publicDir = join(root, 'public')

const log = (message) => console.log(`  ${message}`)

/* ==========================================================================
 *  BAGIAN 1 — ORNAMEN SVG (mawar dusty blue + daun zaitun + garis emas)
 * ========================================================================== */

const TONES = {
  blue: { outer: '#a9b9cc', mid: '#8098b4', inner: '#607a9a', core: '#4a6183', line: '#3d5170' },
  champagne: { outer: '#e6d5b4', mid: '#d2b787', inner: '#bb9a5f', core: '#9a7a46', line: '#7c6137' },
  olive: { outer: '#b6b7a3', mid: '#8f9080', inner: '#6f7059', core: '#5c5d47', line: '#4a4b39' },
}

const petalPath = (r) => {
  const f = (value) => Number(value.toFixed(2))
  return [
    `M0,${f(-r)}`,
    `C${f(r * 0.55)},${f(-r)} ${f(r * 0.98)},${f(-r * 0.62)} ${f(r * 0.98)},${f(-r * 0.05)}`,
    `C${f(r * 0.98)},${f(r * 0.6)} ${f(r * 0.52)},${f(r)} 0,${f(r)}`,
    `C${f(-r * 0.52)},${f(r)} ${f(-r * 0.98)},${f(r * 0.6)} ${f(-r * 0.98)},${f(-r * 0.05)}`,
    `C${f(-r * 0.98)},${f(-r * 0.62)} ${f(-r * 0.55)},${f(-r)} 0,${f(-r)}`,
    'Z',
  ].join(' ')
}

/** Mawar bergaya ilustrasi: empat lapis kelopak + inti spiral. */
function rose({ cx, cy, r, rotate = 0, tone = 'blue', opacity = 1 }) {
  const c = TONES[tone] ?? TONES.blue
  const layers = [
    { radius: r, count: 5, offset: 0, fill: c.outer, fillOpacity: 0.5 },
    { radius: r * 0.73, count: 5, offset: 36, fill: c.mid, fillOpacity: 0.6 },
    { radius: r * 0.47, count: 5, offset: 72, fill: c.inner, fillOpacity: 0.72 },
    { radius: r * 0.25, count: 4, offset: 18, fill: c.core, fillOpacity: 0.82 },
  ]

  const petals = layers
    .map((layer) =>
      Array.from({ length: layer.count })
        .map(
          (_, index) =>
            `<path d="${petalPath(layer.radius)}" fill="${layer.fill}" fill-opacity="${layer.fillOpacity}" stroke="${c.line}" stroke-opacity="0.15" stroke-width="${Math.max(0.5, r * 0.012)}" transform="rotate(${layer.offset + (360 / layer.count) * index})"/>`,
        )
        .join(''),
    )
    .join('')

  return `<g transform="translate(${cx} ${cy}) rotate(${rotate})" opacity="${opacity}">
    <circle r="${r * 1.25}" fill="${c.outer}" opacity="0.12"/>
    <g filter="url(#soften)">${petals}</g>
    <circle r="${r * 0.16}" fill="${c.core}" opacity="0.9"/>
    <path d="M0,${-r * 0.14} C${r * 0.1},${-r * 0.14} ${r * 0.14},${-r * 0.07} ${r * 0.14},0 C${r * 0.14},${r * 0.09} ${r * 0.07},${r * 0.14} 0,${r * 0.14} C${-r * 0.08},${r * 0.14} ${-r * 0.14},${r * 0.07} ${-r * 0.14},0 C${-r * 0.14},${-r * 0.06} ${-r * 0.07},${-r * 0.12} 0,${-r * 0.12} C${r * 0.07},${-r * 0.12} ${r * 0.11},${-r * 0.07} ${r * 0.11},${-r * 0.02}" fill="none" stroke="${c.line}" stroke-opacity="0.4" stroke-width="${Math.max(0.6, r * 0.02)}" stroke-linecap="round"/>
  </g>`
}

/** Tangkai daun zaitun yang tumbuh dari (x, y) ke arah `angle`. */
function leafSpray({ x, y, length = 220, angle = 0, opacity = 1, leaves = 3, tone = 'olive' }) {
  const c = TONES[tone] ?? TONES.olive
  const stem = `<path d="M0,0 C${length * 0.34},${-length * 0.04} ${length * 0.66},${-length * 0.09} ${length},${-length * 0.05}" fill="none" stroke="${c.inner}" stroke-opacity="0.55" stroke-width="${Math.max(1, length * 0.008)}" stroke-linecap="round"/>`

  const layout = [
    { rotate: -36, size: 0.34 },
    { rotate: 4, size: 0.4 },
    { rotate: 42, size: 0.32 },
  ].slice(0, leaves)

  const items = layout
    .map((leaf, index) => {
      const leafLength = length * leaf.size
      const width = leafLength * 0.28
      const path = `M0,0 C${leafLength * 0.3},${-width} ${leafLength * 0.72},${-width * 0.92} ${leafLength},0 C${leafLength * 0.72},${width * 0.92} ${leafLength * 0.3},${width} 0,0 Z`
      return `<g transform="translate(${length * (0.12 + index * 0.26)} ${index % 2 === 0 ? -length * 0.02 : length * 0.02}) rotate(${leaf.rotate})">
        <path d="${path}" fill="${c.inner}" fill-opacity="0.85"/>
        <path d="${path}" fill="#ffffff" fill-opacity="0.07"/>
        <path d="M${leafLength * 0.05},0 C${leafLength * 0.36},${-width * 0.18} ${leafLength * 0.72},${-width * 0.1} ${leafLength * 0.92},0" fill="none" stroke="${c.core}" stroke-opacity="0.45" stroke-width="${Math.max(0.6, width * 0.05)}" stroke-linecap="round"/>
      </g>`
    })
    .join('')

  return `<g transform="translate(${x} ${y}) rotate(${angle})" opacity="${opacity}">${stem}${items}</g>`
}

/** Lengkung emas tipis. */
function goldFlourish({ x, y, width = 260, angle = 0, opacity = 0.85, flip = false }) {
  const h = width * 0.42
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${flip ? -1 : 1} 1)" opacity="${opacity}" fill="none" stroke="url(#goldGrad)" stroke-linecap="round">
    <path d="M0,${h * 0.86} C${width * 0.2},${h * 0.86} ${width * 0.32},${h * 0.52} ${width * 0.47},${h * 0.36} C${width * 0.63},${h * 0.18} ${width * 0.76},${h * 0.16} ${width},${h * 0.04}" stroke-width="2.2"/>
    <path d="M${width * 0.04},${h} C${width * 0.24},${h * 0.94} ${width * 0.36},${h * 0.66} ${width * 0.52},${h * 0.5} C${width * 0.66},${h * 0.36} ${width * 0.8},${h * 0.32} ${width * 0.96},${h * 0.22}" stroke-width="1.1" opacity="0.65"/>
    <path d="M${width * 0.26},${h * 0.64} C${width * 0.32},${h * 0.5} ${width * 0.38},${h * 0.48} ${width * 0.44},${h * 0.46} C${width * 0.4},${h * 0.58} ${width * 0.34},${h * 0.66} ${width * 0.26},${h * 0.64} Z" fill="url(#goldGrad)" stroke="none" opacity="0.7"/>
    <circle cx="${width * 0.78}" cy="${h * 0.24}" r="3" fill="url(#goldGrad)" stroke="none"/>
    <circle cx="${width * 0.88}" cy="${h * 0.14}" r="2" fill="url(#goldGrad)" stroke="none"/>
  </g>`
}

/** Definisi <defs> standar untuk semua SVG placeholder. */
function svgDefs(width, height, tint) {
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="#FFFDF8"/>
      <stop offset="45%" stop-color="#F7F5EF"/>
      <stop offset="100%" stop-color="${tint}"/>
    </linearGradient>
    <radialGradient id="glowA" cx="30%" cy="24%" r="60%">
      <stop offset="0%" stop-color="#7188A5" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#7188A5" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="76%" cy="82%" r="62%">
      <stop offset="0%" stop-color="#77785F" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#77785F" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d6bd93"/>
      <stop offset="45%" stop-color="#b9955b"/>
      <stop offset="100%" stop-color="#8f7343"/>
    </linearGradient>
    <filter id="soften" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${Math.max(1.2, width * 0.002)}"/>
    </filter>
    <filter id="water" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="${Math.max(18, width * 0.03)}"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>`
}

/** Kerangka SVG: latar, sapuan watercolor, bingkai emas, dan tekstur kertas. */
function svgShell({ width, height, tint, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  ${svgDefs(width, height, tint)}
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#glowA)"/>
  <rect width="${width}" height="${height}" fill="url(#glowB)"/>
  <g filter="url(#water)" opacity="0.5">
    <circle cx="${width * 0.22}" cy="${height * 0.2}" r="${Math.min(width, height) * 0.22}" fill="#a9b9cc" opacity="0.5"/>
    <circle cx="${width * 0.82}" cy="${height * 0.78}" r="${Math.min(width, height) * 0.26}" fill="#c9bca1" opacity="0.45"/>
  </g>
  ${body}
  <rect x="${width * 0.035}" y="${height * 0.035}" width="${width * 0.93}" height="${height * 0.93}" fill="none" stroke="url(#goldGrad)" stroke-opacity="0.35" stroke-width="${Math.max(1, width * 0.0016)}"/>
  <rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.05"/>
</svg>
`
}

/** Foto mempelai (placeholder potret 4:5). */
function coupleSvg({ width = 900, height = 1125, tone = 'blue', mirror = false }) {
  const body = `
  <g transform="${mirror ? `translate(${width} 0) scale(-1 1)` : ''}">
    ${goldFlourish({ x: width * 0.45, y: height * 0.08, width: width * 0.42, angle: 6, opacity: 0.7 })}
    ${leafSpray({ x: width * 0.6, y: height * 0.22, length: width * 0.34, angle: -18, opacity: 0.85 })}
  </g>
  ${rose({ cx: width * 0.19, cy: height * 0.15, r: width * 0.155, rotate: -8, tone })}
  ${rose({ cx: width * 0.33, cy: height * 0.085, r: width * 0.07, rotate: 24, tone, opacity: 0.9 })}
  ${leafSpray({ x: width * 0.08, y: height * 0.86, length: width * 0.4, angle: -32, opacity: 0.8 })}
  ${rose({ cx: width * 0.84, cy: height * 0.9, r: width * 0.11, rotate: 14, tone: 'champagne', opacity: 0.9 })}
  <g transform="translate(${width / 2} ${height * 0.46})">
    <ellipse rx="${width * 0.2}" ry="${height * 0.13}" fill="#7188A5" opacity="0.14"/>
    <ellipse cy="${height * 0.09}" rx="${width * 0.3}" ry="${height * 0.22}" fill="#7188A5" opacity="0.12"/>
  </g>
  <text x="${width / 2}" y="${height * 0.79}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="${width * 0.045}" fill="#8a7f70">Foto Mempelai</text>
  <text x="${width / 2}" y="${height * 0.845}" text-anchor="middle" font-family="Georgia, serif" font-size="${width * 0.028}" letter-spacing="${width * 0.005}" fill="#a89c8b">Ganti dengan foto asli</text>
  `
  return svgShell({ width, height, tint: '#EDE7DA', body })
}

/* Sembilan komposisi galeri yang berbeda-beda. */
const GALLERY_SPECS = [
  { file: 'gallery-01.svg', width: 900, height: 1200, tone: 'blue', variant: 0 },
  { file: 'gallery-02.svg', width: 1200, height: 900, tone: 'champagne', variant: 1 },
  { file: 'gallery-03.svg', width: 1000, height: 1000, tone: 'blue', variant: 2 },
  { file: 'gallery-04.svg', width: 900, height: 1200, tone: 'olive', variant: 3 },
  { file: 'gallery-05.svg', width: 1200, height: 900, tone: 'blue', variant: 4 },
  { file: 'gallery-06.svg', width: 1000, height: 1000, tone: 'champagne', variant: 5 },
  { file: 'gallery-07.svg', width: 900, height: 1200, tone: 'blue', variant: 6 },
  { file: 'gallery-08.svg', width: 1200, height: 900, tone: 'olive', variant: 7 },
  { file: 'gallery-09.svg', width: 900, height: 1200, tone: 'champagne', variant: 8 },
]

function gallerySvg({ width, height, tone, variant, label }) {
  const w = width
  const h = height
  const compositions = [
    // Setiap varian mengubah posisi mawar, jumlah daun, dan arah lengkung emas.
    `${rose({ cx: w * 0.2, cy: h * 0.17, r: w * 0.15, rotate: -10, tone })}
     ${leafSpray({ x: w * 0.05, y: h * 0.09, length: w * 0.3, angle: 12 })}
     ${goldFlourish({ x: w * 0.52, y: h * 0.06, width: w * 0.4, angle: 8 })}
     ${rose({ cx: w * 0.88, cy: h * 0.93, r: w * 0.09, rotate: 30, tone: 'champagne', opacity: 0.85 })}`,

    `${rose({ cx: w * 0.85, cy: h * 0.18, r: w * 0.13, rotate: 12, tone })}
     ${leafSpray({ x: w * 0.62, y: h * 0.06, length: w * 0.32, angle: -22, leaves: 2 })}
     ${goldFlourish({ x: w * 0.04, y: h * 0.06, width: w * 0.36, angle: -4, flip: false })}
     ${rose({ cx: w * 0.14, cy: h * 0.88, r: w * 0.1, rotate: -18, tone: 'champagne' })}`,

    `${rose({ cx: w * 0.5, cy: h * 0.16, r: w * 0.12, rotate: 0, tone, opacity: 0.95 })}
     ${leafSpray({ x: w * 0.16, y: h * 0.2, length: w * 0.3, angle: 36, leaves: 2 })}
     ${leafSpray({ x: w * 0.86, y: h * 0.2, length: w * 0.3, angle: 168, leaves: 2 })}
     ${rose({ cx: w * 0.16, cy: h * 0.92, r: w * 0.08, rotate: -22, tone: 'champagne', opacity: 0.9 })}`,

    `${rose({ cx: w * 0.18, cy: h * 0.9, r: w * 0.15, rotate: 16, tone })}
     ${leafSpray({ x: w * 0.04, y: h * 0.96, length: w * 0.34, angle: -24 })}
     ${goldFlourish({ x: w * 0.44, y: h * 0.92, width: w * 0.42, angle: -10 })}
     ${rose({ cx: w * 0.86, cy: h * 0.1, r: w * 0.085, rotate: 8, tone: 'olive', opacity: 0.8 })}`,

    `${goldFlourish({ x: w * 0.06, y: h * 0.18, width: w * 0.42, angle: 4 })}
     ${rose({ cx: w * 0.28, cy: h * 0.74, r: w * 0.12, rotate: -6, tone })}
     ${leafSpray({ x: w * 0.42, y: h * 0.84, length: w * 0.3, angle: -34, leaves: 2 })}
     ${rose({ cx: w * 0.9, cy: h * 0.12, r: w * 0.09, rotate: 20, tone: 'champagne' })}`,

    `${rose({ cx: w * 0.5, cy: h * 0.88, r: w * 0.14, rotate: -8, tone })}
     ${leafSpray({ x: w * 0.2, y: h * 0.94, length: w * 0.28, angle: -40, leaves: 2 })}
     ${leafSpray({ x: w * 0.8, y: h * 0.94, length: w * 0.28, angle: 220, leaves: 2 })}
     ${goldFlourish({ x: w * 0.28, y: h * 0.06, width: w * 0.4, angle: 2 })}`,

    `${rose({ cx: w * 0.82, cy: h * 0.22, r: w * 0.16, rotate: 18, tone })}
     ${leafSpray({ x: w * 0.62, y: h * 0.1, length: w * 0.32, angle: 26, leaves: 2 })}
     ${rose({ cx: w * 0.14, cy: h * 0.1, r: w * 0.07, rotate: -14, tone: 'champagne' })}
     ${goldFlourish({ x: w * 0.06, y: h * 0.9, width: w * 0.4, angle: -8 })}`,

    `${leafSpray({ x: w * 0.08, y: h * 0.2, length: w * 0.34, angle: 20 })}
     ${rose({ cx: w * 0.24, cy: h * 0.3, r: w * 0.1, rotate: -12, tone })}
     ${rose({ cx: w * 0.74, cy: h * 0.78, r: w * 0.13, rotate: 10, tone: 'olive' })}
     ${goldFlourish({ x: w * 0.5, y: h * 0.86, width: w * 0.42, angle: 6 })}`,

    `${rose({ cx: w * 0.16, cy: h * 0.14, r: w * 0.11, rotate: 4, tone: 'champagne' })}
     ${rose({ cx: w * 0.86, cy: h * 0.3, r: w * 0.1, rotate: -16, tone })}
     ${leafSpray({ x: w * 0.58, y: h * 0.06, length: w * 0.3, angle: -14, leaves: 2 })}
     ${goldFlourish({ x: w * 0.08, y: h * 0.88, width: w * 0.38, angle: -6 })}`,
  ]

  const body = `
  <g>${compositions[variant % compositions.length]}</g>
  <g transform="translate(${w / 2} ${h * 0.5})" opacity="0.5">
    <rect x="${-w * 0.16}" y="${-h * 0.06}" width="${w * 0.32}" height="${h * 0.12}" rx="${Math.min(w, h) * 0.02}" fill="none" stroke="url(#goldGrad)" stroke-opacity="0.5" stroke-width="${Math.max(1, w * 0.0018)}"/>
    <path d="M${-w * 0.05},${-h * 0.012} L${w * 0.05},${-h * 0.012} M${-w * 0.05},${h * 0.012} L${w * 0.05},${h * 0.012}" stroke="url(#goldGrad)" stroke-opacity="0.6" stroke-width="${Math.max(1, w * 0.003)}" stroke-linecap="round"/>
  </g>
  <text x="${w / 2}" y="${h * 0.5 + h * 0.115}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="${Math.min(w, h) * 0.038}" fill="#8a7f70">${label || 'Foto Prewedding'}</text>
  <text x="${w / 2}" y="${h * 0.5 + h * 0.155}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.min(w, h) * 0.023}" letter-spacing="${Math.min(w, h) * 0.004}" fill="#a89c8b">Ganti dengan foto asli</text>
  `

  return svgShell({ width: w, height: h, tint: '#EDE7DA', body })
}

function buildImages() {
  mkdirSync(join(publicDir, 'images', 'couple'), { recursive: true })
  mkdirSync(join(publicDir, 'images', 'gallery'), { recursive: true })

  writeFileSync(join(publicDir, 'images', 'couple', 'bride.svg'), coupleSvg({ tone: 'blue', mirror: false }))
  writeFileSync(join(publicDir, 'images', 'couple', 'groom.svg'), coupleSvg({ tone: 'blue', mirror: true }))
  log('public/images/couple/bride.svg + groom.svg')

  GALLERY_SPECS.forEach((spec, index) => {
    const svg = gallerySvg({ ...spec, label: `Foto ${String(index + 1).padStart(2, '0')}` })
    writeFileSync(join(publicDir, 'images', 'gallery', spec.file), svg)
  })
  log(`public/images/gallery/ (${GALLERY_SPECS.length} berkas SVG, rasio beragam)`)
}

/* ==========================================================================
 *  BAGIAN 2 — ENCODER PNG (untuk og-image.png tanpa dependensi eksternal)
 * ========================================================================== */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i += 1) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)
  return Buffer.concat([length, typeBuffer, data, crc])
}

function encodePng(width, height, rgb) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 2 // truecolor RGB
  header[10] = 0
  header[11] = 0
  header[12] = 0

  const stride = width * 3
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

const hexToRgb = (hex) => {
  const value = hex.replace('#', '')
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)]
}

function createCanvas(width, height, baseColor) {
  const data = Buffer.alloc(width * height * 3)
  const [r, g, b] = hexToRgb(baseColor)
  for (let i = 0; i < width * height; i += 1) {
    data[i * 3] = r
    data[i * 3 + 1] = g
    data[i * 3 + 2] = b
  }

  const blend = (x, y, color, alpha) => {
    if (x < 0 || y < 0 || x >= width || y >= height || alpha <= 0) return
    const index = (y * width + x) * 3
    const a = Math.min(1, alpha)
    data[index] = Math.round(data[index] * (1 - a) + color[0] * a)
    data[index + 1] = Math.round(data[index + 1] * (1 - a) + color[1] * a)
    data[index + 2] = Math.round(data[index + 2] * (1 - a) + color[2] * a)
  }

  const ellipse = (cx, cy, rx, ry, color, alpha, rotation = 0) => {
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)
    const bound = Math.ceil(Math.max(rx, ry) * 1.5)
    for (let y = Math.floor(cy - bound); y <= cy + bound; y += 1) {
      for (let x = Math.floor(cx - bound); x <= cx + bound; x += 1) {
        const dx = x - cx
        const dy = y - cy
        const nx = (dx * cos + dy * sin) / rx
        const ny = (-dx * sin + dy * cos) / ry
        const distance = nx * nx + ny * ny
        if (distance <= 1) {
          blend(x, y, color, alpha * (distance > 0.72 ? (1 - distance) / 0.28 : 1))
        }
      }
    }
  }

  const ring = (cx, cy, radius, thickness, color, alpha) => {
    const outer = radius + thickness
    for (let y = Math.floor(cy - outer); y <= cy + outer; y += 1) {
      for (let x = Math.floor(cx - outer); x <= cx + outer; x += 1) {
        const distance = Math.hypot(x - cx, y - cy)
        if (distance <= outer && distance >= radius) {
          const edge = Math.min(1, (outer - distance) / (thickness * 0.9), (distance - radius) / (thickness * 0.9))
          blend(x, y, color, alpha * Math.max(0, edge))
        }
      }
    }
  }

  const rectBorder = (x, y, w, h, thickness, color, alpha) => {
    for (let i = 0; i < thickness; i += 1) {
      for (let px = x + i; px < x + w - i; px += 1) {
        blend(px, y + i, color, alpha)
        blend(px, y + h - 1 - i, color, alpha)
      }
      for (let py = y + i; py < y + h - i; py += 1) {
        blend(x + i, py, color, alpha)
        blend(x + w - 1 - i, py, color, alpha)
      }
    }
  }

  /** Garis dengan ujung membulat dan tepi halus (antialias sederhana). */
  const line = (x0, y0, x1, y1, thickness, color, alpha) => {
    const minX = Math.floor(Math.min(x0, x1) - thickness - 2)
    const maxX = Math.ceil(Math.max(x0, x1) + thickness + 2)
    const minY = Math.floor(Math.min(y0, y1) - thickness - 2)
    const maxY = Math.ceil(Math.max(y0, y1) + thickness + 2)
    const dx = x1 - x0
    const dy = y1 - y0
    const lengthSq = dx * dx + dy * dy || 1
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        let t = ((x - x0) * dx + (y - y0) * dy) / lengthSq
        t = t < 0 ? 0 : t > 1 ? 1 : t
        const distance = Math.hypot(x - (x0 + t * dx), y - (y0 + t * dy))
        const edge = Math.min(1, Math.max(0, (thickness - distance) / 1.4))
        if (edge > 0) blend(x, y, color, alpha * edge)
      }
    }
  }

  /** Rangkaian garis (polyline) dengan ketebalan tertentu. */
  const stroke = (points, thickness, color, alpha) => {
    for (let i = 0; i < points.length - 1; i += 1) {
      line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], thickness, color, alpha)
    }
  }

  return { data, width, height, blend, ellipse, ring, rectBorder, line, stroke }
}

/* ---------------------------------------------------------------------------
 *  Font garis sederhana (hanya huruf yang dibutuhkan: D I A N H E G K).
 *  Setiap huruf berupa daftar polyline pada kotak 0..1 (y menghadap ke bawah).
 * ------------------------------------------------------------------------- */
const STROKE_GLYPHS = {
  D: [
    [
      [0.14, 0],
      [0.14, 1],
    ],
    [
      [0.14, 0],
      [0.5, 0],
      [0.84, 0.26],
      [0.84, 0.74],
      [0.5, 1],
      [0.14, 1],
    ],
  ],
  I: [
    [
      [0.5, 0],
      [0.5, 1],
    ],
    [
      [0.24, 0],
      [0.76, 0],
    ],
    [
      [0.24, 1],
      [0.76, 1],
    ],
  ],
  A: [
    [
      [0.03, 1],
      [0.5, 0],
      [0.97, 1],
    ],
    [
      [0.23, 0.62],
      [0.77, 0.62],
    ],
  ],
  N: [
    [
      [0.14, 1],
      [0.14, 0],
      [0.86, 1],
      [0.86, 0],
    ],
  ],
  H: [
    [
      [0.14, 0],
      [0.14, 1],
    ],
    [
      [0.86, 0],
      [0.86, 1],
    ],
    [
      [0.14, 0.54],
      [0.86, 0.54],
    ],
  ],
  E: [
    [
      [0.82, 0],
      [0.18, 0],
      [0.18, 1],
      [0.82, 1],
    ],
    [
      [0.18, 0.52],
      [0.7, 0.52],
    ],
  ],
  G: [
    [
      [0.86, 0.2],
      [0.6, 0.02],
      [0.28, 0.07],
      [0.13, 0.36],
      [0.15, 0.74],
      [0.4, 0.98],
      [0.68, 0.92],
      [0.85, 0.73],
      [0.85, 0.56],
      [0.52, 0.56],
    ],
  ],
  K: [
    [
      [0.15, 0],
      [0.15, 1],
    ],
    [
      [0.85, 0.02],
      [0.17, 0.58],
    ],
    [
      [0.4, 0.4],
      [0.88, 1],
    ],
  ],
  U: [
    [
      [0.14, 0],
      [0.14, 0.7],
      [0.3, 0.94],
      [0.5, 1],
      [0.7, 0.94],
      [0.86, 0.7],
      [0.86, 0],
    ],
  ],
  P: [
    [
      [0.16, 1],
      [0.16, 0],
      [0.56, 0],
      [0.84, 0.15],
      [0.84, 0.4],
      [0.56, 0.55],
      [0.16, 0.55],
    ],
  ],
  R: [
    [
      [0.16, 1],
      [0.16, 0],
      [0.56, 0],
      [0.84, 0.15],
      [0.84, 0.4],
      [0.56, 0.55],
      [0.16, 0.55],
    ],
    [
      [0.5, 0.55],
      [0.88, 1],
    ],
  ],
  T: [
    [
      [0.06, 0],
      [0.94, 0],
    ],
    [
      [0.5, 0],
      [0.5, 1],
    ],
  ],
}

/**
 * Menggambar kata memakai font garis.
 * @returns {number} lebar total kata dalam piksel
 */
function measureWord(word, height, tracking = 0.34) {
  const count = word.length
  if (count === 0) return 0
  const glyphWidth = height * 0.72
  const spacing = height * tracking
  return count * glyphWidth + (count - 1) * spacing
}

function drawWord(canvas, word, { x, y, height, color, alpha, weight = 0.1, tracking = 0.34 }) {
  const glyphWidth = height * 0.72
  const spacing = height * tracking
  let cursor = x
  for (const character of word.toUpperCase()) {
    const glyph = STROKE_GLYPHS[character]
    if (glyph) {
      for (const polyline of glyph) {
        const points = polyline.map(([gx, gy]) => [cursor + gx * glyphWidth, y + gy * height])
        canvas.stroke(points, height * weight, color, alpha)
      }
    }
    cursor += glyphWidth + spacing
  }
  return cursor - x - spacing
}

function drawCenteredWord(canvas, word, options) {
  const width = measureWord(word, options.height, options.tracking ?? 0.34)
  return drawWord(canvas, word, { ...options, x: options.centerX - width / 2 })
}

/** Garis emas yang menipis di kedua ujung. */
function drawTaperedRule(canvas, centerX, y, halfWidth, color, maxAlpha = 0.65) {
  const steps = 48
  for (let i = 0; i < steps; i += 1) {
    const t = i / (steps - 1)
    const x0 = centerX - halfWidth + halfWidth * 2 * t
    const x1 = centerX - halfWidth + halfWidth * 2 * ((i + 1) / (steps - 1))
    canvas.line(x0, y, x1, y, 1.4, color, maxAlpha * Math.sin(Math.PI * t))
  }
}

/** Mawar: banyak cincin kelopak yang menghadap keluar, makin kecil ke inti. */
function drawRose(canvas, cx, cy, radius, rotation, palette) {
  // Aura watercolor yang sangat lembut
  canvas.ellipse(cx, cy, radius * 1.12, radius * 1.12, palette.outer, 0.08)

  const rings = [
    { scale: 1.0, count: 8, alpha: 0.34, color: palette.outer },
    { scale: 0.84, count: 8, alpha: 0.42, color: palette.outer },
    { scale: 0.68, count: 7, alpha: 0.5, color: palette.mid },
    { scale: 0.53, count: 7, alpha: 0.58, color: palette.mid },
    { scale: 0.39, count: 6, alpha: 0.66, color: palette.inner },
    { scale: 0.26, count: 5, alpha: 0.75, color: palette.inner },
    { scale: 0.15, count: 4, alpha: 0.88, color: palette.core },
  ]

  for (const [ringIndex, ring] of rings.entries()) {
    const ringRadius = radius * ring.scale
    for (let i = 0; i < ring.count; i += 1) {
      const offset = (Math.PI * 2 * i) / ring.count + (ringIndex % 2 === 0 ? 0 : Math.PI / ring.count)
      const angle = rotation + offset
      const px = cx + Math.cos(angle) * ringRadius * 0.5
      const py = cy + Math.sin(angle) * ringRadius * 0.5
      canvas.ellipse(px, py, ringRadius * 0.46, ringRadius * 0.3, ring.color, ring.alpha, angle)
    }
  }

  canvas.ellipse(cx, cy, radius * 0.09, radius * 0.09, palette.core, 0.9)
}

/** Tangkai daun zaitun: satu batang dengan pasangan daun berselang-seling. */
function drawSprig(canvas, cx, cy, angle, length, color, { leafScale = 1, pairs = 6 } = {}) {
  const endX = cx + Math.cos(angle) * length
  const endY = cy + Math.sin(angle) * length
  canvas.line(cx, cy, endX, endY, 2.2, color, 0.45)

  for (let i = 1; i <= pairs; i += 1) {
    const t = i / (pairs + 0.35)
    const px = cx + Math.cos(angle) * length * t
    const py = cy + Math.sin(angle) * length * t
    const leafLength = (42 - i * 3.4) * leafScale
    const leafAngle = angle + (i % 2 === 0 ? 1 : -1) * 0.92
    canvas.ellipse(
      px + Math.cos(leafAngle) * leafLength * 0.8,
      py + Math.sin(leafAngle) * leafLength * 0.8,
      leafLength,
      leafLength * 0.33,
      color,
      0.58,
      leafAngle,
    )
  }
}

/** Dua cincin bertaut sebagai lambang pernikahan. */
function drawRings(canvas, cx, cy, radius, thickness, colorA, colorB) {
  const offset = radius * 0.62
  canvas.ring(cx - offset, cy, radius, thickness, colorA, 0.9)
  canvas.ring(cx + offset, cy, radius, thickness, colorB, 0.95)
}

/** Gambar Open Graph 1200×630 (ivory + emas + mawar + daun zaitun + nama). */
function buildOgImage() {
  const width = 1200
  const height = 630
  const canvas = createCanvas(width, height, '#FFFDF8')
  const gold = hexToRgb('#B9955B')
  const goldLight = hexToRgb('#D6BD93')
  const goldDark = hexToRgb('#8F7343')
  const blue = hexToRgb('#8098B4')
  const blueLight = hexToRgb('#A9B9CC')
  const blueDeep = hexToRgb('#4F6480')
  const olive = hexToRgb('#77785F')
  const oliveDeep = hexToRgb('#5C5D47')
  const ivory = hexToRgb('#F7F5EF')
  const cocoa = hexToRgb('#5B5044')

  // Gradasi lembut + sapuan watercolor
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const vertical = y / height
      const glowA = Math.max(0, 1 - Math.hypot((x - 210) / 560, (y - 140) / 440))
      const glowB = Math.max(0, 1 - Math.hypot((x - 1010) / 560, (y - 530) / 420))
      canvas.blend(x, y, blue, 0.18 * glowA)
      canvas.blend(x, y, olive, 0.15 * glowB)
      canvas.blend(x, y, hexToRgb('#EDE7DA'), 0.12 * vertical)
    }
  }

  // Tekstur butiran kertas
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const noise = (((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) + 1) % 1
      canvas.blend(x, y, [0, 0, 0], noise * 0.02)
    }
  }

  // Bingkai emas ganda
  canvas.rectBorder(40, 40, width - 80, height - 80, 2, gold, 0.55)
  canvas.rectBorder(52, 52, width - 104, height - 104, 1, goldLight, 0.45)

  // Area pusat dibuat lebih terang agar teks menonjol
  canvas.ellipse(600, 300, 400, 200, ivory, 0.4)

  /* ---------------- Ornamen floral di empat penjuru ---------------- */
  const blueRose = { outer: blueLight, mid: blue, inner: blueDeep, core: hexToRgb('#3D5170') }
  const champagneRose = { outer: hexToRgb('#E6D5B4'), mid: hexToRgb('#D2B787'), inner: gold, core: goldDark }

  drawSprig(canvas, 250, 40, 0.95, 190, olive, { leafScale: 0.9, pairs: 6 })
  drawSprig(canvas, 24, 330, -0.45, 165, olive, { leafScale: 0.8, pairs: 5 })
  drawRose(canvas, 158, 148, 112, 0.32, blueRose)
  drawRose(canvas, 262, 58, 46, 1.1, champagneRose)

  drawSprig(canvas, 890, 610, -0.85, 190, olive, { leafScale: 0.9, pairs: 6 })
  drawSprig(canvas, 1180, 300, Math.PI - 0.5, 170, olive, { leafScale: 0.8, pairs: 5 })
  drawRose(canvas, 1046, 482, 96, 1.2, blueRose)
  drawRose(canvas, 930, 588, 40, 2.1, champagneRose)

  /* ---------------- Teks & ornamen tengah ---------------- */
  drawTaperedRule(canvas, 600, 128, 240, gold, 0.6)

  drawCenteredWord(canvas, 'DIANA', {
    centerX: 600,
    y: 158,
    height: 84,
    color: gold,
    alpha: 0.95,
    weight: 0.085,
    tracking: 0.36,
  })

  drawRings(canvas, 600, 296, 28, 4, goldDark, gold)

  drawCenteredWord(canvas, 'HENGKI', {
    centerX: 600,
    y: 352,
    height: 84,
    color: gold,
    alpha: 0.95,
    weight: 0.085,
    tracking: 0.36,
  })

  drawCenteredWord(canvas, 'UNDANGAN PERNIKAHAN', {
    centerX: 600,
    y: 470,
    height: 22,
    color: cocoa,
    alpha: 0.62,
    weight: 0.13,
    tracking: 0.42,
  })

  drawTaperedRule(canvas, 600, 520, 240, gold, 0.6)

  mkdirSync(publicDir, { recursive: true })
  writeFileSync(join(publicDir, 'og-image.png'), encodePng(width, height, canvas.data))
  log('public/og-image.png (1200×630, nama pengantin + ornamen floral)')
}

/* ==========================================================================
 *  BAGIAN 3 — MUSIK LATAR (WAV hasil sintesis, placeholder bebas lisensi)
 * ========================================================================== */

function buildAudio() {
  const sampleRate = 22050
  const duration = 28
  const total = sampleRate * duration
  const buffer = new Float32Array(total)

  const noteFreq = (semitone) => 440 * 2 ** ((semitone - 9) / 12) // 0 = C4

  // Progresi akor sederhana (nada dasar C mayor): C - Am - F - G - C - F
  const progression = [
    [0, 4, 7, 12],
    [-3, 0, 4, 9],
    [-7, -3, 0, 5],
    [-5, 2, 7, 11],
    [0, 4, 7, 14],
    [-7, -3, 0, 7],
  ]
  const barSeconds = 4
  const eighth = barSeconds / 8
  const pattern = [0, 1, 2, 3, 2, 1, 3, 2]

  const addBell = (startSeconds, semitone, amplitude, decay = 3.1) => {
    const frequency = noteFreq(semitone)
    const start = Math.round(startSeconds * sampleRate)
    const length = Math.min(total - start, Math.round(sampleRate * 3.2))
    if (length <= 0) return
    const partials = [
      [1, 1],
      [2, 0.4],
      [3, 0.15],
      [4.18, 0.08],
      [5.43, 0.04],
    ]
    for (let i = 0; i < length; i += 1) {
      const t = i / sampleRate
      let value = 0
      for (const [multiple, gain] of partials) {
        value += gain * Math.sin(2 * Math.PI * frequency * multiple * t) * Math.exp(-t * decay * (0.7 + multiple * 0.25))
      }
      buffer[start + i] += value * amplitude * 0.32
    }
  }

  const addPad = (startSeconds, semitones, amplitude) => {
    const start = Math.round(startSeconds * sampleRate)
    const length = Math.min(total - start, Math.round(sampleRate * barSeconds * 1.05))
    if (length <= 0) return
    for (let i = 0; i < length; i += 1) {
      const t = i / sampleRate
      const attack = Math.min(1, t / 1.2)
      const release = Math.min(1, (length / sampleRate - t) / 1.2)
      let value = 0
      for (const semitone of semitones) {
        value += Math.sin(2 * Math.PI * noteFreq(semitone - 12) * t)
      }
      buffer[start + i] += (value / semitones.length) * amplitude * 0.12 * attack * Math.max(0, release)
    }
  }

  progression.forEach((chord, barIndex) => {
    const barStart = barIndex * barSeconds
    addPad(barStart, chord, 1)
    // Nada bas ringan pada ketukan pertama
    addBell(barStart, chord[0] - 12, 1.1, 2.4)
    for (let step = 0; step < 8; step += 1) {
      const time = barStart + step * eighth
      if (time >= duration) break
      const note = chord[pattern[step] % chord.length]
      addBell(time, note, step % 2 === 0 ? 1 : 0.68)
    }
    // Aksen tinggi lembut di akhir bar
    addBell(barStart + barSeconds - eighth / 2, chord[3] + 12, 0.35, 4)
  })

  // Reverb sederhana (dua tap delay) agar terdengar lembut dan luas
  const taps = [
    { delay: 0.093, feedback: 0.34 },
    { delay: 0.171, feedback: 0.22 },
  ]
  for (const tap of taps) {
    const delaySamples = Math.round(tap.delay * sampleRate)
    for (let i = delaySamples; i < total; i += 1) {
      buffer[i] += buffer[i - delaySamples] * tap.feedback
    }
  }

  // Pelembut nada tinggi sederhana (moving average 3 titik)
  const smoothed = new Float32Array(total)
  for (let i = 1; i < total - 1; i += 1) {
    smoothed[i] = (buffer[i - 1] + buffer[i] * 2 + buffer[i + 1]) / 4
  }

  // Normalisasi + fade in/out supaya loop tidak mengejutkan telinga
  let peak = 0
  for (let i = 0; i < total; i += 1) peak = Math.max(peak, Math.abs(smoothed[i]))
  const gain = peak > 0 ? 0.72 / peak : 1
  const fadeIn = sampleRate * 2
  const fadeOut = sampleRate * 3

  const pcm = Buffer.alloc(total * 2)
  for (let i = 0; i < total; i += 1) {
    let value = smoothed[i] * gain
    if (i < fadeIn) value *= i / fadeIn
    const remaining = total - i
    if (remaining < fadeOut) value *= remaining / fadeOut
    const clipped = Math.max(-1, Math.min(1, value))
    pcm.writeInt16LE(Math.round(clipped * 32767), i * 2)
  }

  const header = Buffer.alloc(44)
  header.write('RIFF', 0, 'ascii')
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8, 'ascii')
  header.write('fmt ', 12, 'ascii')
  header.writeUInt32LE(16, 16) // ukuran sub-chunk fmt
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28) // byte rate
  header.writeUInt16LE(2, 32) // block align
  header.writeUInt16LE(16, 34) // bit depth
  header.write('data', 36, 'ascii')
  header.writeUInt32LE(pcm.length, 40)

  mkdirSync(join(publicDir, 'audio'), { recursive: true })
  writeFileSync(join(publicDir, 'audio', 'wedding-bgm.wav'), Buffer.concat([header, pcm]))
  log(`public/audio/wedding-bgm.wav (${duration}s, ${(pcm.length / 1024 / 1024).toFixed(2)} MB, placeholder)`)
}

/* ========================================================================== */

console.log('\nMembuat aset placeholder undangan…\n')
buildImages()
buildOgImage()
buildAudio()
console.log('\nSelesai. Semua aset placeholder siap dipakai — jangan lupa diganti dengan aset asli.\n')
