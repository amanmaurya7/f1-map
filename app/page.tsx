"use client"

import { useRef, useState, useEffect } from "react"
import Image from 'next/image'
import { LocationMarker } from '../components/location-marker'
import { UserLocation } from "../components/user-location"
import  F1BottomNavigation  from "../components/F1BottomNavigation"
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

interface PaddingOptions {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export function convertToPixelPosition(
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

export function isWithinBounds(lat: number, lng: number): boolean {
  return lat >= MAP_BOUNDS.south && lat <= MAP_BOUNDS.north && 
         lng >= MAP_BOUNDS.west && lng <= MAP_BOUNDS.east
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [setDimensions] = useState({ width: 0, height: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateDimensions = () => {
      if (mapRef.current) {
        setDimensions({
          width: mapRef.current.offsetWidth,
          height: mapRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

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
        <div className="flex-1 overflow-auto px-4 py-2 pb-16">
          <div className="mx-auto">
            <div 
              ref={mapRef} 
              className="relative bg-white rounded-lg shadow-lg" 
              style={{ width: '1000px', height: '800px' }}
            >
              <div
                className="relative w-[1000px] h-[800px]"
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
                          1000, 
                          800, 
                          specificPadding
                        )} 
                      />
                    ))}
                    <UserLocation mapWidth={1000} mapHeight={800} />
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