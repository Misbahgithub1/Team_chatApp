import { useEffect, useState } from 'react'
import './App.scss'
import { DashboardLayout } from './layout/DashboardLayout'
import {
  fetchCountries,
  fetchCitiesByCountry,
  type Country,
  type City,
} from './services/locationApi'

const STORAGE_KEY = 'chatapp.displayName'
const CITY_STORAGE_KEY = 'chatapp.city'
const COUNTRY_STORAGE_KEY = 'chatapp.country'

function App() {
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [pendingName, setPendingName] = useState('')

  const [city, setCity] = useState<string | null>(null)
  const [pendingCity, setPendingCity] = useState('')

  const [country, setCountry] = useState<string | null>(null)
  const [pendingCountry, setPendingCountry] = useState('')

  const [isLoaded, setIsLoaded] = useState(false)

  // Location data
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])

  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  const [countriesError, setCountriesError] = useState<string | null>(null)
  const [citiesError, setCitiesError] = useState<string | null>(null)

  /* ----------------------------------
     Load countries on mount
  ----------------------------------- */
  useEffect(() => {
    setIsLoadingCountries(true)
    setCountriesError(null)

    fetchCountries()
      .then(setCountries)
      .catch((error) => {
        console.error('Failed to load countries:', error)
        setCountriesError('Failed to load countries. Please refresh.')
      })
      .finally(() => {
        setIsLoadingCountries(false)
      })
  }, [])

  /* ----------------------------------
     Load cities when country changes
  ----------------------------------- */
  useEffect(() => {
    if (!pendingCountry) {
      setCities([])
      setPendingCity('')
      return
    }

    setIsLoadingCities(true)
    setCitiesError(null)

    fetchCitiesByCountry(pendingCountry)
      .then((data) => {
        setCities(data)
        setPendingCity('')
        if (data.length === 0) {
          setCitiesError('Cities not available for this country')
        }
      })
      .catch((error) => {
        console.error('Failed to load cities:', error)
        setCities([])
        setCitiesError('Failed to load cities')
      })
      .finally(() => {
        setIsLoadingCities(false)
      })
  }, [pendingCountry])

  /* ----------------------------------
     Restore saved identity
  ----------------------------------- */
  useEffect(() => {
    try {
      const storedName = localStorage.getItem(STORAGE_KEY)
      const storedCity = localStorage.getItem(CITY_STORAGE_KEY)
      const storedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY)

      if (storedName) {
        setDisplayName(storedName)
        setPendingName(storedName)
      }

      if (storedCountry) {
        setCountry(storedCountry)
        setPendingCountry(storedCountry)

        fetchCitiesByCountry(storedCountry)
          .then(setCities)
          .catch(() => setCities([]))
      }

      if (storedCity) {
        setCity(storedCity)
        setPendingCity(storedCity)
      }
    } catch {
      // fail silently
    } finally {
      setIsLoaded(true)
    }
  }, [])

  /* ----------------------------------
     Submit identity
  ----------------------------------- */
  const handleNameSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const name = pendingName.trim()
    const selectedCity = pendingCity.trim()
    const selectedCountry = pendingCountry.trim()

    if (!name || !selectedCity || !selectedCountry) return

    setDisplayName(name)
    setCity(selectedCity)
    setCountry(selectedCountry)

    try {
      localStorage.setItem(STORAGE_KEY, name)
      localStorage.setItem(CITY_STORAGE_KEY, selectedCity)
      localStorage.setItem(COUNTRY_STORAGE_KEY, selectedCountry)
    } catch {
      // ignore storage errors
    }
  }

  if (!isLoaded) return null

  return (
    <>
      {!displayName && (
        <div className="identity-overlay">
          <div className="identity-card">
            <h1 className="identity-card__title">Welcome to Chat Console</h1>
            <p className="identity-card__subtitle">
              Choose how you’d like your name to appear in conversations.
            </p>

            <form className="identity-card__form" onSubmit={handleNameSubmit}>
              {/* Name */}
              <label className="identity-card__label" htmlFor="displayName">
                Display name
              </label>
              <input
                id="displayName"
                className="identity-card__input"
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value)}
                placeholder="e.g. Alex Rivera"
              />

              {/* Country */}
              <label className="identity-card__label" htmlFor="country">
                Country
              </label>
              <select
                id="country"
                className="identity-card__input"
                value={pendingCountry}
                onChange={(e) => setPendingCountry(e.target.value)}
                disabled={isLoadingCountries}
              >
                <option value="">Select a country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {countriesError && (
                <div className="identity-card__error">{countriesError}</div>
              )}

              {/* City */}
              <label className="identity-card__label" htmlFor="city">
                City
              </label>

       
                <select
                  id="city"
                  className="identity-card__input"
                  value={pendingCity}
                  onChange={(e) => setPendingCity(e.target.value)}
                  disabled={!pendingCountry || isLoadingCities}
                >
                  <option value="" disabled>
                    Select a city
                  </option>

                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>

                {/* subtle loader next to dropdown */}
                {isLoadingCities && cities.length > 0 && (
                  <span
                    className="identity-card__loader"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.75rem',
                      color: '#666',
                    }}
                  >
                    ⏳
                  </span>
                )}
         


              {citiesError && (
                <div className="identity-card__error">{citiesError}</div>
              )}

              <button
                type="submit"
                className="identity-card__button"
                disabled={
                  !pendingName.trim() ||
                  !pendingCountry.trim() ||
                  !pendingCity.trim() ||
                  isLoadingCountries ||
                  isLoadingCities
                }
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      <DashboardLayout
        displayName={displayName ?? ''}
        city={city ?? ''}
        country={country ?? ''}
      />
    </>
  )
}

export default App
