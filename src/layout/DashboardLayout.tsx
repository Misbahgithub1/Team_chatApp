import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { ChatArea } from './ChatArea'
import { WeatherPanel } from './WeatherPanel'
import { LogoutButton } from '../components/LogoutButton'
// import { LogoutButton } from './LogoutButton' // import the logout component

type DashboardLayoutProps = {
  children?: ReactNode
  displayName?: string
  city?: string
  country?: string
  onLogout?: () => void // new prop to handle logout
}

export function DashboardLayout({
  children,
  displayName,
  city,
  country,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div className="app app--dark">
      <div className="container-fluid min-vh-100">
        <div className="row h-100">
          {/* Sidebar */}
        
          <aside className="col-12 col-md-3 col-lg-2 app-sidebar">
            <Sidebar />
          </aside>

          {/* Chat Area */}
          <main className="col-12 col-md-6 col-lg-7 app-chat">
            {/* Header with Logout */}
            <div className="chat-header d-flex justify-content-between align-items-center mb-2">
              <div className="chat-header__user">
                {displayName} • {city}, {country}
              </div>
              {onLogout && <LogoutButton onLogout={onLogout} />}
            </div>

            <ChatArea displayName={displayName} city={city} country={country} />
          </main>

          {/* Weather Panel */}
          <section className="col-12 col-md-3 col-lg-3 app-weather">
            <WeatherPanel roomId="general" />
          </section>
        </div>

        {children}
      </div>
    </div>
  )
}
