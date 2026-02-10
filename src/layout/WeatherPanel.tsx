import { useTeamWeather } from "../hooks/useTeamWeather"

type WeatherPanelProps = {
  roomId: string
  city?: string  
}

export function WeatherPanel({ roomId }: WeatherPanelProps) {
  const { members, status, error } = useTeamWeather({ roomId })

  const isLoading = status === 'loading'
  const hasError = status === 'error'

  return (
    <div className="layout-panel layout-panel--weather">
      <header className="layout-panel__header">
        <h2 className="layout-panel__title">Team Weather</h2>

        {import.meta.env.DEV && (
          <span style={{ fontSize: '12px', color: '#fff', marginLeft: '8px' }}>
            {status} ({members.length})
          </span>
        )}
      </header>

      <div className="layout-panel__body">
        {/* Render members as soon as they exist - prioritize showing members */}
        {members.length > 0 && (
          <>
            {members.map((member, index) => {
              // Ensure weather object exists
              const weather = member.weather || { temperature: null, condition: null, icon: null }

              // Format temperature - show actual value or placeholder
              const temperature =
                weather?.temperature != null && typeof weather.temperature === 'number'
                  ? `${Math.round(weather.temperature)}°`
                  : '—'

              // Format condition - capitalize first letter, handle null/undefined
              let condition = 'Loading weather…'
              if (weather?.condition) {
                condition = weather.condition.charAt(0).toUpperCase() + weather.condition.slice(1)
                if (condition.toLowerCase().includes('weather service not configured')) {
                  condition = 'Weather unavailable'
                }
              }

              // Get location info - always show location
              const locationCity = member.city || 'Unknown location'
              const locationCountry = member.country

              // 🔹 Use unique key by combining username + index
              return (
                <div key={`${member.username}-${index}`} className="weather-summary">
                  <div>
                    <div className="weather-summary__temp">{temperature}</div>
                    <div className="weather-summary__meta">{condition}</div>
                  </div>

                  <div>
                    <div className="weather-summary__meta weather-summary__meta--name">
                      {member.username}
                    </div>
                    <div className="weather-summary__meta weather-summary__meta--location">
                      {locationCity}
                      {locationCountry && (
                        <span className="weather-summary__country">
                          {' · '}
                          {locationCountry}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Show loading ONLY if no members yet */}
        {isLoading && members.length === 0 && (
          <div className="weather-summary">
            <div className="weather-summary__meta">Loading team weather…</div>
          </div>
        )}

        {/* Show error ONLY if no members and there's an error */}
        {hasError && members.length === 0 && (
          <div className="weather-summary">
            <div className="weather-summary__meta">{error}</div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !hasError && members.length === 0 && (
          <div className="weather-summary">
            <div className="weather-summary__meta">No team members in this room.</div>
          </div>
        )}
      </div>
    </div>
  )
}
