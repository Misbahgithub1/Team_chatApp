export function Sidebar() {
  return (
    <div className="layout-panel layout-panel--sidebar">
      <header className="layout-panel__header">
        <h2 className="layout-panel__title">Workspace</h2>
      </header>

      <nav className="layout-panel__body">
        <div className="sidebar-section">
          <div className="sidebar-section__label">Teams</div>
          <ul className="sidebar-nav">
            <li className="sidebar-nav__item sidebar-nav__item--active">
              <span className="sidebar-nav__item-title">Customer Success</span>
              <span className="sidebar-nav__item-meta">24 active</span>
            </li>
            <li className="sidebar-nav__item">
              <span className="sidebar-nav__item-title">Sales Pod A</span>
              <span className="sidebar-nav__item-meta">12 active</span>
            </li>

            <li className="sidebar-nav__item">
              <span className="sidebar-nav__item-title">Sales Pod B</span>
              <span className="sidebar-nav__item-meta">10 active</span>
            </li>


            <li className="sidebar-nav__item">
              <span className="sidebar-nav__item-title">Incident Bridge</span>
              <span className="sidebar-nav__item-meta">3 active</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section__label">Pinned</div>
          <ul className="sidebar-nav">
            <li className="sidebar-nav__item">
              <span className="sidebar-nav__item-title">Priority Escalations</span>
            </li>
            <li className="sidebar-nav__item">
              <span className="sidebar-nav__item-title">QA Handoff</span>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  )
}

