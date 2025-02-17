/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React, { useEffect, useState, useCallback } from "react"
import { isWithinBounds, convertToPixelPosition } from "../utils/coordinates"

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

  // Debounce function
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  useEffect(() => {
    return () => {};
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    let lastUpdate = 0;
    const MIN_UPDATE_INTERVAL = 500; // 500ms debounce time
    const MIN_DISTANCE_CHANGE = 10; // 10 meters minimum change

    const calculateDistance = (pos1: GeolocationPosition, pos2: GeolocationPosition) => {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = pos1.coords.latitude * Math.PI/180;
      const φ2 = pos2.coords.latitude * Math.PI/180;
      const Δφ = (pos2.coords.latitude - pos1.coords.latitude) * Math.PI/180;
      const Δλ = (pos2.coords.longitude - pos1.coords.longitude) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c;
    };

    let lastPosition: GeolocationPosition | null = null;

    const debouncedPositionUpdate = debounce((pos: GeolocationPosition) => {
      const now = Date.now();
      
      // Skip if not enough time has passed
      if (now - lastUpdate < MIN_UPDATE_INTERVAL) return;

      // Skip if position hasn't changed enough
      if (lastPosition) {
        const distance = calculateDistance(lastPosition, pos);
        if (distance < MIN_DISTANCE_CHANGE) return;
      }

      lastUpdate = now;
      lastPosition = pos;

      const withinBounds = isWithinBounds(pos.coords.latitude, pos.coords.longitude);
      setIsOutOfBounds(!withinBounds);
      
      if (withinBounds) {
        setPosition(pos);
        onLocationUpdate?.(pos.coords.latitude, pos.coords.longitude);
      }
    }, MIN_UPDATE_INTERVAL);

    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 30000, // Increased cache time
    };

    const watchId = navigator.geolocation.watchPosition(
      debouncedPositionUpdate,
      (error) => {
        console.error("Geolocation error:", error);
      },
      options
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [debounce, onLocationUpdate]);

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