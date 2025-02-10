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
            <div className="map">
            <Image
            src="/images/head.png"
            alt="header"
            width={100}
            height={50}
            priority
          />
            </div>
          
        </div>
        <div className="flex-1 overflow-hidden px-4 py-2 pb-16"> {/* Added pb-16 for bottom spacing */}
          <div className="h-full max-w-3xl mx-auto">
            <div ref={mapRef} className="relative w-full h-full bg-white rounded-lg shadow-lg">
              <div className="relative w-full h-full">
                <Image
                  src="/map_image.png"
                  alt="Suzuka Map"
                  className="w-full h-full object-contain"
                  width={1000}
                  height={1000}
                  priority
                />
                {mounted && dimensions.width > 0 && (
                  <>
                    {COORDINATES.map((coord) => (
                      <LocationMarker
                        key={coord.label}
                        coordinate={coord}
                        position={convertToPixelPosition(coord.lat, coord.lng, dimensions.width, dimensions.height)}
                      />
                    ))}
                    <UserLocation mapWidth={dimensions.width} mapHeight={dimensions.height} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0"> 
          <F1BottomNavigation />
        </div>
      </div>
    )
  }

