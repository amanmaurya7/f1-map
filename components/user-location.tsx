"use client"
import React, { useEffect, useState } from "react"
import { isWithinBounds, convertToPixelPosition } from "../utils/coordinates"
import { getNetworkStatus, monitorNetworkChanges } from "../utils/network"

interface UserLocationProps {
  mapWidth: number
  mapHeight: number
  onLocationUpdate?: (lat: number, lng: number) => void
  isVisible?: boolean
  scale?: number
  offset?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }
}

export function UserLocation({
  mapWidth,
  mapHeight,
  onLocationUpdate,
  isVisible = true,
  scale = 1,
  offset = { top: 0, right: 0, bottom: 0, left: 0  }
}: UserLocationProps) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [isOutOfBounds, setIsOutOfBounds] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<{ type: string; speed?: number }>({ type: 'unknown' })
  
  // Base size for the marker
  const baseSize = 24
  const size = baseSize * scale

  // Normalize offset object with defaults
  const normalizedOffset = {
    top: offset.top ?? 0,
    right: offset.right ?? 0,
    bottom: offset.bottom ?? 0,
    left: offset.left ?? 0
  }

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

  const pixelPosition = convertToPixelPosition(
    position.coords.latitude,
    position.coords.longitude,
    mapWidth,
    mapHeight
  )

  // Calculate final position with offsets
  const finalLeft = pixelPosition.x - (size / 2) + normalizedOffset.left - normalizedOffset.right
  const finalTop = pixelPosition.y - size + normalizedOffset.top - normalizedOffset.bottom

  return (
    <div
      className="absolute"
      style={{
        left: `${finalLeft}px`,
        top: `${finalTop}px`,
        transition: 'transform 0.2s ease-out',
      }}
    >
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="6"
            fill="#e50111"
            fillOpacity="0.8"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        </svg>
       
        <div
          className="absolute top-0 left-0 w-full h-full animate-ping"
          style={{ transform: `scale(${scale})` }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="8"
              fill="#e50111"
              fillOpacity="0.3"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}