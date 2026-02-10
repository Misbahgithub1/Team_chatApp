import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { getSocket } from '../services/socketClient'

export type TeamMemberWeather = {
  id: string
  username: string
  city: string
  country: string | null
  weather: {
    temperature: number | null
    condition: string
    icon: string | null
    error?: string
  } | null
}

type UseTeamWeatherOptions = {
  roomId: string
}

type UseTeamWeatherResult = {
  members: TeamMemberWeather[]
  status: 'idle' | 'loading' | 'Active' | 'error'
  error: string | null
}

export function useTeamWeather({
  roomId,
}: UseTeamWeatherOptions): UseTeamWeatherResult {
  const [members, setMembers] = useState<TeamMemberWeather[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'Active' | 'error'>(
    'idle',
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket: Socket = getSocket()

    function handleUsersWeatherUpdate(payload: {
      roomId: string
      users: TeamMemberWeather[]
    }) {
      if (payload.roomId !== roomId) return
      setMembers(payload.users)
      setStatus('Active')
      setError(null)
    }

    function handleUsersWeatherError(payload: {
      roomId: string
      message: string
    }) {
      if (payload.roomId !== roomId) return
      setStatus('error')
      setError(payload.message)
      setMembers([])
    }

    function handleConnect() {
      setStatus('loading')
      setError(null)
      // Request team weather when socket connects
      socket.emit('requestTeamWeather', { roomId })
    }

    function handleDisconnect() {
      setStatus('idle')
      setMembers([])
      setError(null)
    }

    // Initial state when roomId changes
    setStatus('loading')
    setMembers([])
    setError(null)

    // Register listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('usersWeatherUpdate', handleUsersWeatherUpdate)
    socket.on('usersWeatherError', handleUsersWeatherError)

    // If alActive connected, request weather immediately
    if (socket.connected) {
      handleConnect()
      socket.emit('requestTeamWeather', { roomId })
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('usersWeatherUpdate', handleUsersWeatherUpdate)
      socket.off('usersWeatherError', handleUsersWeatherError)
    }
  }, [roomId])

  return {
    members,
    status,
    error,
  }
}
