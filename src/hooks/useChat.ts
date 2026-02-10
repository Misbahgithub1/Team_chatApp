import { useEffect, useMemo, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { getSocket } from '../services/socketClient'

export type ChatMessage = {
  id: string
  roomId: string
  content: string
  sender: string
  timestamp: string
  fromSelf?: boolean
}

type UseChatOptions = {
  roomId: string
  displayName: string
  city: string
  country: string
}

type UseChatResult = {
  messages: ChatMessage[]
  isConnected: boolean
  sendMessage: (content: string) => void
}

/**
 * 🔊 App-level notification sound (no audio file)
 */
function playNotificationSound() {
  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext
    const audioCtx = new AudioContext()

    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.type = 'sine' // clean professional sound
    oscillator.frequency.value = 880 // notification pitch
    gainNode.gain.value = 0.08 // low volume (professional)

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.15)
  } catch {
    // silently ignore audio errors
  }
}

export function useChat({
  roomId,
  displayName,
  city,
  country,
}: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const normalizedName = useMemo(
    () => (displayName || 'You').trim() || 'You',
    [displayName],
  )

  useEffect(() => {
    const socket: Socket = getSocket()

    function handleConnect() {
      setIsConnected(true)
      socket.emit('joinRoom', {
        roomId,
        username: normalizedName,
        city,
        country,
      })
    }

    function handleDisconnect() {
      setIsConnected(false)
    }

    function handleRoomHistory(payload: {
      roomId: string
      messages: ChatMessage[]
    }) {
      if (payload.roomId !== roomId) return

      setMessages(
        payload.messages.map((message) => ({
          ...message,
          fromSelf: message.sender === normalizedName,
        })),
      )
    }

    function handleIncomingMessage(message: ChatMessage) {
      if (message.roomId !== roomId) return

      const fromSelf = message.sender === normalizedName

      setMessages((current) => [
        ...current,
        {
          ...message,
          fromSelf,
        },
      ])

      // 🔔 Play sound only for incoming messages
      if (!fromSelf && document.hidden) {
        playNotificationSound()
      }
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('roomHistory', handleRoomHistory)
    socket.on('message', handleIncomingMessage)

    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.emit('leaveRoom', { roomId })
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('roomHistory', handleRoomHistory)
      socket.off('message', handleIncomingMessage)
    }
  }, [roomId, normalizedName, city, country])

  const sendMessage = (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    const socket = getSocket()
    socket.emit('sendMessage', {
      roomId,
      content: trimmed,
      sender: normalizedName,
    })
  }

  return {
    messages,
    isConnected,
    sendMessage,
  }
}
