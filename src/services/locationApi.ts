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

/**
 * Fetch list of all countries
 * (NO CHANGE – already stable)
 */
export async function fetchCountries(): Promise<Country[]> {
  const response = await fetch(COUNTRIES_API)

  if (!response.ok) {
    throw new Error(`Failed to fetch countries: ${response.status}`)
  }

  const data = await response.json()

  return data
    .map((country: any) => ({
      name: country.name.common,
      code: country.cca2,
    }))
    .sort((a: Country, b: Country) =>
      a.name.localeCompare(b.name)
    )
}

/**
 * Fetch list of cities for a given country
 * (FIXED – no crashes, no infinite loading)
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
    // IMPORTANT: never throw for free / unstable APIs
    console.warn(
      `Unable to load cities for ${countryName}`,
      error
    )
    return []
  }
}
