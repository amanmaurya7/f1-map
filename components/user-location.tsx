/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React, { useEffect, useState, useCallback, useRef } from "react"
import { isWithinBounds, convertToPixelPosition } from "../utils/coordinates"
import { 
  getNetworkStatus, 
  monitorNetworkChanges, 
  checkLocationAccuracy,
  isLocationStable,
  type NetworkStatus 
} from "../utils/network"

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
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(getNetworkStatus())
  const [locationQuality, setLocationQuality] = useState<{ accuracy: number; isStable: boolean }>({
    accuracy: 0,
    isStable: true
  });
  const [recentPositions, setRecentPositions] = useState<GeolocationPosition[]>([]);

  const lastUpdateRef = useRef<number>(0);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);

  const MIN_UPDATE_INTERVAL = 500; // 500ms minimum time between updates
  const MIN_DISTANCE_CHANGE = 10; // 10 meters minimum distance change

  const calculateDistance = useCallback((pos1: GeolocationPosition, pos2: GeolocationPosition): number => {
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
  }, []);

  const debouncedPositionUpdate = useCallback((pos: GeolocationPosition) => {
    const now = Date.now();
    
    // Check time interval
    if (now - lastUpdateRef.current < MIN_UPDATE_INTERVAL) {
      return;
    }

    // Check distance change
    if (lastPositionRef.current) {
      const distance = calculateDistance(lastPositionRef.current, pos);
      if (distance < MIN_DISTANCE_CHANGE) {
        return;
      }
    }

    // Update refs
    lastUpdateRef.current = now;
    lastPositionRef.current = pos;

    const testResult = checkLocationAccuracy(pos);
    
    setRecentPositions(prev => {
      const newPositions = [...prev, pos].slice(-10);
      return newPositions;
    });

    setLocationQuality({
      accuracy: testResult.accuracy,
      isStable: isLocationStable(recentPositions)
    });

    if (testResult.accuracy <= 100) {
      const withinBounds = isWithinBounds(pos.coords.latitude, pos.coords.longitude);
      setIsOutOfBounds(!withinBounds);
      
      if (withinBounds) {
        setPosition(pos);
        onLocationUpdate?.(pos.coords.latitude, pos.coords.longitude);
      }
    }
  }, [calculateDistance, onLocationUpdate, recentPositions]);

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
    const cleanup = monitorNetworkChanges(setNetworkStatus);
    return cleanup;
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: networkStatus.isOnline ? 30000 : 60000, // Increase cache time when offline
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        // Wrap the position update in a debounced function
        setTimeout(() => debouncedPositionUpdate(pos), 300);
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      options
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [debouncedPositionUpdate, networkStatus.isOnline]);

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

  // Modify the marker appearance based on location quality
  const getMarkerColor = () => {
    if (!locationQuality.isStable) return "#FFA500"; // Orange for unstable
    if (locationQuality.accuracy > 50) return "#FFFF00"; // Yellow for poor accuracy
    return "#e50111"; // Default red for good accuracy
  };

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
            fill={getMarkerColor()}
            fillOpacity="0.8"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        </svg>
       
        <div
          className="absolute top-0 left-0 w-full h-full animate-ping"
          style={{ transform: `scale(${scale})` }}
        ></div>
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          ></svg>
            <circle
              cx="12"
              cy="12"
              r="8"
              fill="#e50111"
              fillOpacity="0.3"
            />
        </div>
      </div>
  )
}