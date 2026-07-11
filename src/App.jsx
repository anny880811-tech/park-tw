import './App.scss'

const colorPalette = [
  ['Primary', '#A7D5D9', '核心品牌色'],
  ['Primary Hover', '#7FC3CA', '互動狀態'],
  ['Secondary', '#5B7C99', '輔助重點'],
  ['Success', '#52B788', '成功狀態'],
  ['Warning', '#F4A261', '提醒狀態'],
  ['Danger', '#E76F51', '危險狀態'],
  ['Background', '#F8FAFC', '頁面底色'],
  ['Surface', '#FFFFFF', '卡片底色'],
  ['Text', '#2F3E46', '主要文字'],
  ['Text Secondary', '#6C757D', '次要文字'],
]

function App() {
  return (
    <main className="app-shell">
      <nav className="navbar navbar-expand bg-white">
        <div className="container">
          <a className="navbar-brand brand-logo" href="/" aria-label="停哪裡 ParkTW">
            <span className="brand-logo__mark">停</span>
            <span>
              <span className="brand-logo__name">停哪裡</span>
              <span className="brand-logo__subname">ParkTW</span>
            </span>
          </a>
          <span className="badge text-bg-primary">Design System</span>
        </div>
      </nav>

      <section className="container design-preview">
        <div className="preview-hero">
          <span className="badge text-bg-secondary mb-3">Brand Foundation</span>
          <h1>停哪裡 Design Preview</h1>
          <p className="lead">
            以手機優先、簡潔柔和的視覺語言建立全站共用設計基礎。
          </p>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary" type="button">
              Primary Button
            </button>
            <button className="btn btn-secondary" type="button">
              Secondary Button
            </button>
            <button className="btn btn-outline-primary" type="button">
              Outline Button
            </button>
          </div>
        </div>

        <section className="preview-section">
          <div>
            <p className="section-label">Color Palette</p>
            <h2>品牌與介面色彩</h2>
          </div>
          <div className="palette-grid">
            {colorPalette.map(([name, color, note]) => (
              <article className="color-card" key={name}>
                <span className="color-card__swatch" style={{ backgroundColor: color }} />
                <strong>{name}</strong>
                <small>{note}</small>
                <code>{color}</code>
              </article>
            ))}
          </div>
        </section>

        <section className="preview-section">
          <div>
            <p className="section-label">Components</p>
            <h2>共用元件樣式</h2>
          </div>
          <div className="component-grid">
            <article className="card">
              <div className="card-body">
                <span className="badge text-bg-success mb-3">Open</span>
                <h3 className="card-title">附近停車提示卡</h3>
                <p className="card-text">
                  卡片使用柔和陰影、清楚層級與留白，適合呈現行動裝置上的摘要資訊。
                </p>
                <button className="btn btn-primary w-100" type="button">
                  查看樣式
                </button>
              </div>
            </article>

            <article className="card">
              <div className="card-body">
                <label className="form-label" htmlFor="preview-search">
                  Input
                </label>
                <input
                  className="form-control"
                  id="preview-search"
                  placeholder="搜尋地點或停車場"
                  type="text"
                />
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <span className="badge text-bg-primary">Primary</span>
                  <span className="badge text-bg-warning">Warning</span>
                  <span className="badge text-bg-danger">Danger</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="preview-section">
          <div>
            <p className="section-label">Typography</p>
            <h2>文字層級</h2>
          </div>
          <div className="typography-card">
            <h1>Heading 1 停哪裡</h1>
            <h2>Heading 2 Design System</h2>
            <h3>Heading 3 Mobile First</h3>
            <p>
              Body 文字保持清楚、現代、容易閱讀，適合手機上的地圖與停車資訊介面。
            </p>
            <small>Small text 用於輔助說明、狀態與次要資訊。</small>
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
