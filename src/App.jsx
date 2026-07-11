import MainLayout from './layouts/MainLayout.jsx'
import Badge from './components/ui/Badge.jsx'
import Button from './components/ui/Button.jsx'
import Card from './components/ui/Card.jsx'
import Input from './components/ui/Input.jsx'
import SearchBar from './components/ui/SearchBar.jsx'

function App() {
  return (
    <MainLayout>
      <section className="container py-5">
        <div className="app-preview">
          <div className="app-preview__intro">
            <Badge variant="primary">UI Components</Badge>
            <h1>停哪裡</h1>
            <p className="lead mb-0">快速查詢附近停車資訊。</p>
          </div>

          <SearchBar
            buttonText="搜尋"
            className="app-preview__search"
            placeholder="搜尋地點或停車場"
          />

          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <Card
                footer={<Button variant="outline">查看更多</Button>}
                subtitle="台中市西屯區"
                title="停車場資訊卡"
              >
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <Badge variant="success">尚有車位</Badge>
                  <Badge variant="secondary">室內停車</Badge>
                  <Badge variant="warning">尖峰時段</Badge>
                </div>
                <p className="mb-0">
                  使用共用 Card、Badge 與 Button 組合，呈現後續停車場列表可重複使用的基礎樣式。
                </p>
              </Card>
            </div>

            <div className="col-12 col-lg-5">
              <Card subtitle="表單與操作元件" title="基本輸入">
                <div className="d-grid gap-3">
                  <Input
                    helpText="可用於地點、停車場名稱或區域關鍵字。"
                    id="keyword"
                    label="關鍵字"
                    placeholder="請輸入地點或停車場名稱"
                  />
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="primary">搜尋</Button>
                    <Button variant="secondary">取消</Button>
                    <Button variant="danger" disabled>
                      停用
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default App
