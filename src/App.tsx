import { useState, useEffect } from 'react'
import './App.scss'
import { DashboardLayout } from './layout/DashboardLayout'
import { IdentityForm } from './components/IdentityForm'
// import {
//   fetchCountries,
//   fetchCitiesByCountry,
//   type Country,
//   type City,
// } from './services/locationApi'

const STORAGE_KEY = 'chatapp.displayName'
const CITY_STORAGE_KEY = 'chatapp.city'
const COUNTRY_STORAGE_KEY = 'chatapp.country'

function App() {
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const storedName = localStorage.getItem(STORAGE_KEY)
      const storedCity = localStorage.getItem(CITY_STORAGE_KEY)
      const storedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY)

      if (storedName) setDisplayName(storedName)
      if (storedCity) setCity(storedCity)
      if (storedCountry) setCountry(storedCountry)
    } catch {
      // fail silently
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CITY_STORAGE_KEY)
    localStorage.removeItem(COUNTRY_STORAGE_KEY)

    setDisplayName(null)
    setCity(null)
    setCountry(null)
  }

  if (!isLoaded) return null

  return (
    <>
      {!displayName && (
        <IdentityForm
          onSubmit={({ name, city, country }) => {
            setDisplayName(name)
            setCity(city)
            setCountry(country)
          }}
        />
      )}

      {displayName && (
        <DashboardLayout
          displayName={displayName}
          city={city ?? ''}
          country={country ?? ''}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}

export default App
