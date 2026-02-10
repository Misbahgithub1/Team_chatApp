import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { ChatArea } from './ChatArea'
import { WeatherPanel } from './WeatherPanel'

type DashboardLayoutProps = {
  children?: ReactNode
  displayName?: string
  city?: string
  country?: string
}

export function DashboardLayout({ children, displayName, city, country }: DashboardLayoutProps) {
  return (
    <div className="app app--dark">
      <div className="container-fluid min-vh-100">
        <div className="row h-100">
          <aside className="col-12 col-md-3 col-lg-2 app-sidebar">
            <Sidebar />
          </aside>

          <main className="col-12 col-md-6 col-lg-7 app-chat">
            <ChatArea displayName={displayName} city={city} country={country} />
          </main>

          <section className="col-12 col-md-3 col-lg-3 app-weather">
            <WeatherPanel roomId="general" city={city} />
          </section>
        </div>

        {children}
      </div>
    </div>
  )
}

