import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

/* ----------------------------------
   ENV & CONSTANTS
----------------------------------- */
dotenv.config()

const PORT = Number(process.env.PORT) || 4000
const WEATHER_API_KEY = process.env.WEATHER_API_KEY
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const WEATHER_CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const DEFAULT_CITY = 'San Francisco'

if (!WEATHER_API_KEY) {
  console.warn('⚠️ WEATHER_API_KEY is missing in .env file')
}

/* ----------------------------------
   APP & SOCKET SETUP
----------------------------------- */
const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

/* ----------------------------------
   IN-MEMORY STORES
----------------------------------- */
const rooms = new Map()
const weatherCache = new Map()

/* ----------------------------------
   WEATHER HELPERS
----------------------------------- */
async function fetchWeatherForCity(city) {
  if (!WEATHER_API_KEY) {
    const err = new Error('WEATHER_API_KEY not configured')
    err.code = 'NO_API_KEY'
    throw err
  }

  const cacheKey = city.toLowerCase()
  const cached = weatherCache.get(cacheKey)
  const now = Date.now()

  if (cached && now - cached.fetchedAt < WEATHER_CACHE_TTL) {
    return cached.data
  }

  const url = new URL(WEATHER_API_BASE_URL)
  url.searchParams.set('q', city)
  url.searchParams.set('appid', WEATHER_API_KEY)
  url.searchParams.set('units', 'metric')

  const response = await fetch(url.toString())

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Weather API failed: ${response.status} ${body}`)
  }

  const json = await response.json()

  const weatherPayload = {
    city: json.name || city,
    temperature: json.main?.temp ?? null,
    condition: json.weather?.[0]?.description ?? 'Unknown',
    icon: json.weather?.[0]?.icon ?? null,
    timestamp: new Date().toISOString(),
    source: 'openweathermap',
  }

  weatherCache.set(cacheKey, {
    data: weatherPayload,
    fetchedAt: now,
  })

  return weatherPayload
}

/* ----------------------------------
   ROOM HELPERS
----------------------------------- */
function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      messages: [],
      users: new Map(),
    })
  }
  return rooms.get(roomId)
}

async function buildTeamWeather(roomId) {
  const room = rooms.get(roomId)
  if (!room || room.users.size === 0) return []

  const results = []

  for (const user of room.users.values()) {
    const city = user.city || DEFAULT_CITY

    try {
      const weather = await fetchWeatherForCity(city)
      results.push({
        username: user.name,
        city,
        country: user.country,
        weather: {
          temperature: weather.temperature,
          condition: weather.condition,
          icon: weather.icon,
        },
      })
    } catch {
      results.push({
        username: user.name,
        city,
        country: user.country,
        weather: {
          temperature: null,
          condition: 'Weather unavailable',
          icon: null,
        },
      })
    }
  }

  return results
}

async function emitTeamWeather(roomId) {
  try {
    const users = await buildTeamWeather(roomId)
    io.to(roomId).emit('usersWeatherUpdate', { roomId, users })
  } catch {
    io.to(roomId).emit('usersWeatherError', {
      roomId,
      message: 'Unable to load team weather data.',
    })
  }
}

/* ----------------------------------
   SOCKET EVENTS
----------------------------------- */
io.on('connection', (socket) => {
  const joinedRooms = new Set()

  socket.on('joinRoom', async ({ roomId, username, city, country }) => {
    if (!roomId) return

    const room = getOrCreateRoom(roomId)
    joinedRooms.add(roomId)
    socket.join(roomId)

    room.users.set(socket.id, {
      name: username?.trim() || 'Guest',
      city: city?.trim() || null,
      country: country?.trim() || null,
    })

    socket.emit('roomHistory', {
      roomId,
      messages: room.messages,
    })

    emitTeamWeather(roomId)

    socket.to(roomId).emit('userJoined', {
      roomId,
      username: username || 'Guest',
    })
  })

  socket.on('requestTeamWeather', ({ roomId }) => {
    if (roomId) emitTeamWeather(roomId)
  })

  socket.on('leaveRoom', ({ roomId }) => {
    if (!roomId || !joinedRooms.has(roomId)) return

    const room = rooms.get(roomId)
    if (!room) return

    const user = room.users.get(socket.id)
    room.users.delete(socket.id)
    joinedRooms.delete(roomId)

    socket.leave(roomId)
    socket.to(roomId).emit('userLeft', {
      roomId,
      username: user?.name || 'Guest',
    })

    emitTeamWeather(roomId)
  })

  socket.on('sendMessage', ({ roomId, content }) => {
    if (!roomId || !content) return

    const room = getOrCreateRoom(roomId)
    const user = room.users.get(socket.id)

    const message = {
      id: crypto.randomUUID(),
      roomId,
      content,
      sender: user?.name || 'Guest',
      timestamp: new Date().toISOString(),
    }

    room.messages.push(message)
    if (room.messages.length > 500) room.messages.shift()

    io.to(roomId).emit('message', message)
  })

  socket.on('disconnect', () => {
    joinedRooms.forEach((roomId) => {
      const room = rooms.get(roomId)
      if (!room) return

      const user = room.users.get(socket.id)
      room.users.delete(socket.id)

      socket.to(roomId).emit('userLeft', {
        roomId,
        username: user?.name || 'Guest',
      })

      emitTeamWeather(roomId)
    })

    joinedRooms.clear()
  })
})

/* ----------------------------------
   HTTP ROUTES
----------------------------------- */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/weather', async (req, res) => {
  const { city } = req.query

  if (!city) {
    return res.status(400).json({ error: 'City query parameter is required' })
  }

  try {
    const weather = await fetchWeatherForCity(city)
    res.json(weather)
  } catch {
    res.status(502).json({ error: 'Failed to fetch weather data' })
  }
})

/* ----------------------------------
   SERVER START
----------------------------------- */
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
