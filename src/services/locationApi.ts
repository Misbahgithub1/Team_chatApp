/**
 * Service for fetching countries and cities from free public APIs
 */

export type Country = {
  name: string
  code: string
}

export type City = {
  name: string
}

const COUNTRIES_API =
  'https://restcountries.com/v3.1/all?fields=name,cca2'

const CITIES_API =
  'https://countriesnow.space/api/v0.1/countries/cities'

const CACHE_KEY = 'team_chat_countries_cache'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Fetch list of all countries
 * Uses local storage caching to improve reliability and performance.
 */
export async function fetchCountries(): Promise<Country[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout

    const response = await fetch(COUNTRIES_API, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.status}`)
    }

    const data = await response.json()

    const countries = data
      .map((country: any) => ({
        name: country.name.common,
        code: country.cca2,
      }))
      .sort((a: Country, b: Country) =>
        a.name.localeCompare(b.name)
      )

    // Cache the successful result
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: countries
      }))
    } catch (e) {
      console.warn('Failed to cache countries data', e)
    }

    return countries
  } catch (error) {
    console.warn('Countries API failed or timed out, trying cache.', error)
    
    // Try to recover from cache
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { timestamp, data } = JSON.parse(cached)
        // Check if cache is valid (less than 7 days old)
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log('Restored countries from cache')
          return data
        }
      }
    } catch (cacheError) {
      console.error('Failed to read from cache', cacheError)
    }

    // If API fails and no cache, return empty array (UI should handle empty state)
    return []
  }
}

/**
 * Fetch list of cities for a given country
 */
export async function fetchCitiesByCountry(
  countryName: string
): Promise<City[]> {
  try {
    const response = await fetch(CITIES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ country: countryName }),
    })

    if (!response.ok) {
      console.warn(
        `Cities API failed for ${countryName}: ${response.status}`
      )
      return []
    }

    const data = await response.json()

    if (!Array.isArray(data?.data)) {
      return []
    }

    return data.data
      .map((cityName: string) => ({ name: cityName }))
      .sort((a: City, b: City) =>
        a.name.localeCompare(b.name)
      )
  } catch (error) {
    console.warn(
      `Unable to load cities for ${countryName}`,
      error
    )
    return []
  }
}
