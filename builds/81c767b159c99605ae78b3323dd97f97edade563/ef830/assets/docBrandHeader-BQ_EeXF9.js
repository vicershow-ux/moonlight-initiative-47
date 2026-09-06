const n=`
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
    width: 72px;
    height: 44px;
    min-width: 72px;
    background-repeat: no-repeat;
    background-position: left center;
    background-size: contain;
    flex: 0 0 auto;
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
`;function t(o=""){return`
  <div class="doc-brand-header">
    <div class="doc-brand"><div class="doc-brand-logo" style="background-image:url('${`${window.location.origin}/logo-224.png`}')"></div>Fix<span>Key</span></div>
    <div class="doc-brand-meta">
      <strong>FixKey</strong>
      ${o}
    </div>
  </div>`}export{t as a,n as d};
