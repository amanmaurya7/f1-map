"use client"

import { useEffect, useState } from "react"
import { isWithinBounds, convertToPixelPosition } from "../utils/coordinates"
import { getNetworkStatus, monitorNetworkChanges } from "../utils/network"

interface UserLocationProps {
  mapWidth: number
  mapHeight: number
  onLocationUpdate?: (lat: number, lng: number) => void
  isVisible?: boolean
}

export function UserLocation({ mapWidth, mapHeight, onLocationUpdate, isVisible = true }: UserLocationProps) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [isOutOfBounds, setIsOutOfBounds] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<{ type: string; speed?: number }>({ type: 'unknown' })

  useEffect(() => {
    getNetworkStatus().then(setNetworkStatus);
    return monitorNetworkChanges(setNetworkStatus);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.")
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: networkStatus.type === 'wifi' ? 5000 : 10000,
      maximumAge: networkStatus.type === 'wifi' ? 0 : 5000,
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos)
        const withinBounds = isWithinBounds(pos.coords.latitude, pos.coords.longitude)
        setIsOutOfBounds(!withinBounds)
        onLocationUpdate?.(pos.coords.latitude, pos.coords.longitude)
      },
      (error) => {
        console.error("Error getting location:", error)
      },
      options
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [onLocationUpdate, networkStatus.type])

  if (!position || isOutOfBounds || !isVisible) return null

  const pixelPosition = convertToPixelPosition(position.coords.latitude, position.coords.longitude, mapWidth, mapHeight)

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${pixelPosition.x}px`,
        top: `${pixelPosition.y}px`,
      }}
    >
      <svg width="70" height="70" viewBox="0 0 50 50">
        <g transform="translate(-193 -540)">
          <circle
            cx="25"
            cy="25"
            r="25"
            transform="translate(193 540)"
            fill="#e50111"
            opacity="0.08"
          />
          <circle
            cx="17.5"
            cy="17.5"
            r="17.5"
            transform="translate(201 548)"
            fill="#e50111"
            opacity="0.08"
          />
          <circle
            cx="8.5"
            cy="8.5"
            r="8.5"
            transform="translate(210 557)"
            fill="#e50111"
            opacity="0.08"
          />
          <circle
            cx="4"
            cy="4"
            r="4"
            transform="translate(214 561)"
            fill="#e50111"
          />
        </g>
      </svg>
    </div>
  )
}
