export const docBrandStyles = `
  .doc-brand-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #5C3A11;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .doc-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: #1a1a1a;
  }
  .doc-brand-logo {
    width: 96px;
    height: 52px;
    min-width: 96px;
    object-fit: contain;
    object-position: left center;
    flex: 0 0 auto;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .doc-brand span { color: #7A4E10; }
  .doc-brand-meta {
    text-align: right;
    font-size: 13px;
    color: #1a1a1a;
  }
  .doc-brand-meta strong {
    display: block;
    font-size: 15px;
    margin-bottom: 2px;
  }
`

export function docBrandHeader(subtitle = ""): string {
  const logo = `${window.location.origin}/logo-print.png`
  return `
  <div class="doc-brand-header">
    <div class="doc-brand"><img class="doc-brand-logo" src="${logo}" alt="FixKey"/>Fix<span>Key</span></div>
    <div class="doc-brand-meta">
      <strong>FixKey</strong>
      ${subtitle}
    </div>
  </div>`
}