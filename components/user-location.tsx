"use client"

import { useEffect, useState } from "react"
import { isWithinBounds, convertToPixelPosition } from "../utils/coordinates"

interface UserLocationProps {
  mapWidth: number
  mapHeight: number
  onLocationUpdate?: (lat: number, lng: number) => void
  isVisible?: boolean
}

export function UserLocation({ mapWidth, mapHeight, onLocationUpdate, isVisible = true }: UserLocationProps) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [isOutOfBounds, setIsOutOfBounds] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.")
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos)
        setIsOutOfBounds(!isWithinBounds(pos.coords.latitude, pos.coords.longitude))
        onLocationUpdate?.(pos.coords.latitude, pos.coords.longitude)
      },
      (error) => {
        console.error("Error getting location:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [onLocationUpdate])

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
