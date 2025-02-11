/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useRef, useState, useEffect } from "react"
import Image from 'next/image'
import { LocationMarker } from '../components/location-marker'
import { UserLocation } from "../components/user-location"
import F1BottomNavigation from "../components/F1BottomNavigation"
import type { Coordinate } from "../types/map"

// Map boundaries
const MAP_BOUNDS = {
  north: 34.854529,
  south: 34.839992,
  east: 136.544621,
  west: 136.521328,
}

const COORDINATES: Coordinate[] = [
  { lat: 34.845644, lng: 136.54065, label: "A" },
  { lat: 34.839992, lng: 136.543937, label: "B" },
  { lat: 34.847328, lng: 136.521328, label: "C" },
  { lat: 34.854529, lng: 136.544621, label: "D" },
]

const MAP_WIDTH = 1000
const MAP_HEIGHT = 800

interface PaddingOptions {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

function convertToPixelPosition(
  lat: number, 
  lng: number, 
  mapWidth: number, 
  mapHeight: number,
  specificPadding?: {
    [key: string]: PaddingOptions
  }
) {
  const latRange = MAP_BOUNDS.north - MAP_BOUNDS.south
  const lngRange = MAP_BOUNDS.east - MAP_BOUNDS.west

  const defaultPadding = {
    top: 0.15,
    bottom: 0.1,
    left: 0.1,
    right: 0.3
  }

  const coordinateLabel = COORDINATES.find(
    coord => coord.lat === lat && coord.lng === lng
  )?.label

  const padding = coordinateLabel && specificPadding?.[coordinateLabel] 
    ? { ...defaultPadding, ...specificPadding[coordinateLabel] } 
    : defaultPadding

  const usableWidth = mapWidth * (1 - padding.left - padding.right)
  const usableHeight = mapHeight * (1 - padding.top - padding.bottom)

  const x = ((lng - MAP_BOUNDS.west) / lngRange) * usableWidth + mapWidth * padding.left
  const y = ((MAP_BOUNDS.north - lat) / latRange) * usableHeight + mapHeight * padding.top

  return { x, y }
}

function isWithinBounds(lat: number, lng: number): boolean {
  return lat >= MAP_BOUNDS.south && lat <= MAP_BOUNDS.north && 
         lng >= MAP_BOUNDS.west && lng <= MAP_BOUNDS.east
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [showOutOfBoundsMessage, setShowOutOfBoundsMessage] = useState(false)
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handler for location updates from UserLocation component
  const handleLocationUpdate = (lat: number, lng: number) => {
    const withinBounds = isWithinBounds(lat, lng)
    setShowOutOfBoundsMessage(!withinBounds)
  }

  const specificPadding = {
    A: { left: 0.18, top: 0.18 },
    B: { right: 0.27, bottom: 0.14 },
    C: { left: 0.048, bottom: 0.022 },
    D: { right: 0.284, top: 0.219 }
  }

  return (
    <>
      <div className="w-full h-screen flex flex-col bg-gray-100">
        <div className="w-full flex justify-center items-center py-4 bg-white rounded-b-[35px] shadow-md">
          <Image
            src="/images/head.png"
            alt="header"
            width={100}
            height={50}
            priority 
          />
        </div>
        
        {/* Add out of bounds message */}
        {showOutOfBoundsMessage && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Notice: </strong>
            <span className="block sm:inline">Your current location is out of bounds and has been disabled.</span>
          </div>
        )}

        <div className="flex-1 overflow-auto px-4 py-2 pb-16">
          <div className="mx-auto">
            <div 
              ref={mapRef} 
              className="relative" 
              style={{ width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px` }}
            >
              <div
                className="relative w-full h-full"
                style={{
                  backgroundImage: 'url(/map_image.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {mounted && (
                  <>
                    {COORDINATES.map((coord) => (
                      <LocationMarker
                        key={coord.label}
                        coordinate={coord}
                        position={convertToPixelPosition(
                          coord.lat, 
                          coord.lng, 
                          MAP_WIDTH, 
                          MAP_HEIGHT, 
                          specificPadding
                        )} 
                      />
                    ))}
                    <UserLocation 
                      mapWidth={MAP_WIDTH} 
                      mapHeight={MAP_HEIGHT} 
                      onLocationUpdate={handleLocationUpdate}
                      isVisible={!showOutOfBoundsMessage}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0">
        <F1BottomNavigation />
      </div>
    </>
  )
}