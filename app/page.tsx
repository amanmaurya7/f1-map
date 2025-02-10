"use client"

import { useRef, useState, useEffect } from "react"
import Image from 'next/image'
import { LocationMarker } from '../components/location-marker'
import { UserLocation } from "../components/user-location"
import { convertToPixelPosition } from "../utils/coordinates"
import { useClientMount } from "../hooks/use-client-mount"
import type { Coordinate } from "../types/map"
import F1BottomNavigation from "../components/F1BottomNavigation"

const COORDINATES: Coordinate[] = [
    { lat: 34.845644, lng: 136.54065, label: "A" },
    { lat: 34.839992, lng: 136.543937, label: "B" },
    { lat: 34.847328, lng: 136.521328, label: "C" },
    { lat: 34.854529, lng: 136.544621, label: "D" },
  ]
  
  export default function MapPage() {
    const mounted = useClientMount()
    const mapRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  
    useEffect(() => {
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
  
    return (
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
            <div ref={mapRef} className="relative bg-white rounded-lg shadow-lg" style={{ width: '1000px', height: '800px' }}>
              <div className="relative">
                <Image
                  src="/map_image.png"
                  alt="Suzuka Map"
                  width={1000}  // fixed width
                  height={800}  // fixed height
                  priority
                  className="w-[1000px] h-[800px]"
                />
                {mounted && (
                  <>
                    {COORDINATES.map((coord) => (
                      <LocationMarker
                        key={coord.label}
                        coordinate={coord}
                        position={convertToPixelPosition(coord.lat, coord.lng, 1000, 800)}
                      />
                    ))}
                    <UserLocation mapWidth={1000} mapHeight={800} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0"> {/* Added wrapper for fixed positioning */}
          <F1BottomNavigation />
        </div>
      </div>
    )
  }

