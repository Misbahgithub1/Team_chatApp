import { useState, useEffect } from 'react'

import './IdentityForm.scss';

import {
  fetchCountries,
  fetchCitiesByCountry,
  type Country,
  type City,
} from '../services/locationApi'

const STORAGE_KEY = 'chatapp.displayName'
const CITY_STORAGE_KEY = 'chatapp.city'
const COUNTRY_STORAGE_KEY = 'chatapp.country'

type IdentityFormProps = {
  onSubmit: (data: { name: string; city: string; country: string }) => void
}

export function IdentityForm({ onSubmit }: IdentityFormProps) {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')

  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])

  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  const [countriesError, setCountriesError] = useState<string | null>(null)
  const [citiesError, setCitiesError] = useState<string | null>(null)

  useEffect(() => {
    setLoadingCountries(true)
    fetchCountries()
      .then(setCountries)
      .catch(() => setCountriesError('Failed to load countries.'))
      .finally(() => setLoadingCountries(false))
  }, [])

  useEffect(() => {
    if (!country) return setCities([])

    setLoadingCities(true)
    fetchCitiesByCountry(country)
      .then(setCities)
      .catch(() => setCitiesError('Failed to load cities.'))
      .finally(() => setLoadingCities(false))
  }, [country])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !city || !country) return

    try {
      localStorage.setItem(STORAGE_KEY, name)
      localStorage.setItem(CITY_STORAGE_KEY, city)
      localStorage.setItem(COUNTRY_STORAGE_KEY, country)
    } catch {}

    onSubmit({ name, city, country })
  }

  return (
    <div className="identity-overlay">
      <div className="identity-card">
        <h1>Welcome to Chat Console</h1>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />

          <label>Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={loadingCountries}>
            <option value="">Select a country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.name}>{c.name}</option>
            ))}
          </select>
          {countriesError && <div>{countriesError}</div>}

          <label>City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!country || loadingCities}>
            <option value="">Select a city</option>
            {cities.map((c, index) => (
              <option key={`${c.name}-${index}`} value={c.name}>{c.name}</option>
            ))}
          </select>
          {citiesError && <div>{citiesError}</div>}

          <button type="submit" disabled={!name || !city || !country}>Continue</button>
        </form>
      </div>
    </div>
  )
}
