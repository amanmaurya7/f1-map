/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useRef, useState, useEffect, useCallback } from "react"
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
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchPoints, setTouchPoints] = useState<Touch[]>([])

  const MAX_ZOOM = 50
  const MIN_ZOOM = 0.01

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

  // Handle zoom via mouse wheel
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const offsetX = (e.clientX - rect.left) / rect.width
    const offsetY = (e.clientY - rect.top) / rect.height
    
    const delta = e.deltaY * -0.02
    const newZoom = Math.min(Math.max(MIN_ZOOM, zoom + delta), MAX_ZOOM)
    setZoom(newZoom)
  }, [zoom])

  // Handle touch events for pinch zoom
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      setTouchPoints(Array.from(e.touches))
    } else if (e.touches.length === 1) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      })
      setIsDragging(true)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const touches = Array.from(e.touches)
      const distance = Math.hypot(
        touches[1].clientX - touches[0].clientX,
        touches[1].clientY - touches[0].clientY
      )
      const prevDistance = Math.hypot(
        touchPoints[1].clientX - touchPoints[0].clientX,
        touchPoints[1].clientY - touchPoints[0].clientY
      )
  
      const zoomFactor = distance / prevDistance
      const newZoom = Math.min(Math.max(MIN_ZOOM, zoom * zoomFactor), MAX_ZOOM)
      setZoom(newZoom)
      setTouchPoints(touches)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setTouchStart(null)
  }

  // Handle double click/tap zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const offsetX = (e.clientX - rect.left) / rect.width
    const offsetY = (e.clientY - rect.top) / rect.height
    
    const newZoom = Math.min(zoom * 1.5, MAX_ZOOM)
    setZoom(newZoom)
  }

  // Zoom control buttons
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, MAX_ZOOM))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, MIN_ZOOM))
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    map.addEventListener('wheel', handleWheel as EventListener, { passive: false })
    map.addEventListener('touchstart', handleTouchStart as EventListener)
    map.addEventListener('touchmove', handleTouchMove as EventListener)
    map.addEventListener('touchend', handleTouchEnd as EventListener)

    return () => {
      map.removeEventListener('wheel', handleWheel as EventListener)
      map.removeEventListener('touchstart', handleTouchStart as EventListener)
      map.removeEventListener('touchmove', handleTouchMove as EventListener)
      map.removeEventListener('touchend', handleTouchEnd as EventListener)
    }
  }, [handleWheel])

  return (
    <div className={`h-screen flex flex-col relative ${showOutOfBoundsMessage ? 'bg-red-50' : 'bg-gray-100'}`}>
      {/* Static Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full flex justify-center items-center py-4 bg-white rounded-b-[35px] shadow-md">
          <Image
            src="/images/head.png"
            alt="header"
            width={100}
            height={50}
            priority 
          />
        </div>

        {/* Out of bounds message - Now positioned directly below header */}
        {showOutOfBoundsMessage && (
          <div className="w-full bg-red-100 border text-red-700 px-4 py-3 text-center" role="alert">
            <span className="block sm:inline">Your current location is out of bounds and has been disabled.</span>
          </div>
        )}
      </div>

      {/* Main scrollable content area with top padding for header and potential message */}
      <div className="flex-1 overflow-auto" style={{ marginTop: showOutOfBoundsMessage ? '140px' : '84px', marginBottom: '64px' }}>
        {/* Map container */}
        <div className="mx-auto px-4 py-2">
          <div 
            ref={mapRef} 
            className="relative" 
            style={{ 
              width: `${MAP_WIDTH}px`, 
              height: `${MAP_HEIGHT}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
            onDoubleClick={handleDoubleClick}
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

      {/* Fixed zoom controls */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50">
        <button 
          className="bg-white rounded-full w-10 h-10 shadow-lg flex items-center justify-center text-black"
          onClick={handleZoomIn}
        >
          <span className="text-2xl">+</span>
        </button>
        <button 
          className="bg-white rounded-full w-10 h-10 shadow-lg flex items-center justify-center text-black"
          onClick={handleZoomOut}
        >
          <span className="text-2xl">-</span>
        </button>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <F1BottomNavigation />
      </div>
    </div>
  )
}