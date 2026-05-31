const DEFAULT_TITLE = '1624 Cards — Pokémon & One Piece TCG Singles'
const DEFAULT_DESC = '1624 Cards — Swiss TCG singles store for Pokémon & One Piece. Scan-verified singles, CHF pricing, Zürich.'

export function setPageMeta(title?: string, description?: string) {
  document.title = title ? `${title} | 1624 Cards` : DEFAULT_TITLE

  const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (desc) desc.content = description ?? DEFAULT_DESC

  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
  if (ogTitle) ogTitle.content = document.title

  const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
  if (ogDesc) ogDesc.content = description ?? DEFAULT_DESC
}

export function setJsonLd(data: object) {
  let el = document.getElementById('json-ld')
  if (!el) {
    el = document.createElement('script')
    el.id = 'json-ld'
    el.setAttribute('type', 'application/ld+json')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export function removeJsonLd() {
  document.getElementById('json-ld')?.remove()
}
