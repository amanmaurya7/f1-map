/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { LocationMarker } from "../components/location-marker";
import { UserLocation } from "../components/user-location";
import F1BottomNavigation from "../components/F1BottomNavigation";
import type { Coordinate } from "../types/map";
import { calculateInitialZoom } from "../utils/viewport";

// Map boundaries
const MAP_BOUNDS = {
  north: 34.854529,
  south: 34.839992,
  east: 136.544621,
  west: 136.521328,
};

const COORDINATES: Coordinate[] = [
  { lat: 34.845644, lng: 136.540650, label: "A" },
  { lat: 34.839992, lng: 136.543937, label: "B" },
  { lat: 34.847328, lng: 136.521328, label: "C" },
  { lat: 34.854529, lng: 136.544621, label: "D" },
];

// Make map dimensions responsive
const getMapDimensions = () => {
  if (typeof window !== "undefined") {
    const width = Math.min(window.innerWidth, 1000);
    const aspectRatio = 800 / 1000; // original height/width
    const height = width * aspectRatio;
    return { width, height };
  }
  return { width: 1000, height: 800 }; // fallback for SSR
};

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
    [key: string]: PaddingOptions;
  }
) {
  const latRange = MAP_BOUNDS.north - MAP_BOUNDS.south;
  const lngRange = MAP_BOUNDS.east - MAP_BOUNDS.west;

  const defaultPadding = {
    top: 0.16,
    bottom: 0.1,
    left: 0.1,
    right: 0.3,
  };

  const coordinateLabel = COORDINATES.find(
    (coord) => coord.lat === lat && coord.lng === lng
  )?.label;

  const padding =
    coordinateLabel && specificPadding?.[coordinateLabel]
      ? { ...defaultPadding, ...specificPadding[coordinateLabel] }
      : defaultPadding;

  const usableWidth = mapWidth * (1 - padding.left - padding.right);
  const usableHeight = mapHeight * (1 - padding.top - padding.bottom);

  const x =
    ((lng - MAP_BOUNDS.west) / lngRange) * usableWidth +
    mapWidth * padding.left;
  const y =
    ((MAP_BOUNDS.north - lat) / latRange) * usableHeight +
    mapHeight * padding.top;

  return { x, y };
}

function isWithinBounds(lat: number, lng: number): boolean {
  return (
    lat >= MAP_BOUNDS.south &&
    lat <= MAP_BOUNDS.north &&
    lng >= MAP_BOUNDS.west &&
    lng <= MAP_BOUNDS.east
  );
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showOutOfBoundsMessage, setShowOutOfBoundsMessage] = useState(false);
  const [zoom, setZoom] = useState(0.1); // Start with small zoom until calculated
  const [isDragging, setIsDragging] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchPoints, setTouchPoints] = useState<Touch[]>([]);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [mapDimensions, setMapDimensions] = useState({
    width: 1000,
    height: 800,
  });
  const [pinScale, setPinScale] = useState(1);

  const MAX_ZOOM = 50;
  const MIN_ZOOM = 0.01;

  // Calculate pin scale based on zoom level
  useEffect(() => {
    if (zoom > 0) {
      // Inverse relationship: as zoom increases, pin size decreases
      const newScale = 1 / Math.sqrt(zoom);

      // Clamp the scale between 0.4 (minimum size) and 1.5 (maximum size)
      const clampedScale = Math.min(Math.max(newScale, 0.4), 1.5);

      setPinScale(clampedScale);
    }
  }, [zoom]);

  // Update map dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setMapDimensions(getMapDimensions());
    };

    if (typeof window !== "undefined") {
      setMapDimensions(getMapDimensions());
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const initialZoom = calculateInitialZoom(
        mapDimensions.width,
        mapDimensions.height
      );
      setZoom(initialZoom);
    }
  }, [mounted, mapDimensions]);

  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level * 100);
        battery.addEventListener("levelchange", () => {
          setBatteryLevel(battery.level * 100);
        });
      });
    }
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", () => {
      setIsBackgroundMode(document.hidden);
    });
  }, []);

  const handleLocationUpdate = (lat: number, lng: number) => {
    const withinBounds = isWithinBounds(lat, lng);
    setShowOutOfBoundsMessage(!withinBounds);
    if (withinBounds) {
      setUserLocation({ lat, lng, label: "User" });
    }
  };

  const specificPadding = {
    A: { left: 0.18, top: 0.21 },
    B: { right: 0.27, bottom: 0.13 },
    C: { left: 0.048, bottom: 0.012 },
    D: { right: 0.284, top: 0.234 },
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newZoom = Math.min(
        Math.max(MIN_ZOOM, zoom * (1 + delta)),
        MAX_ZOOM
      );
      setZoom(newZoom);
    },
    [zoom]
  );

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      setTouchPoints(Array.from(e.touches));
    } else if (e.touches.length === 1) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
      setIsDragging(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touches = Array.from(e.touches);

        // Calculate the new zoom based on pinch gesture
        if (touchPoints.length === 2) {
          const currentDistance = Math.hypot(
            touches[0].clientX - touches[1].clientX,
            touches[0].clientY - touches[1].clientY
          );
          const previousDistance = Math.hypot(
            touchPoints[0].clientX - touchPoints[1].clientX,
            touchPoints[0].clientY - touchPoints[1].clientY
          );

          if (previousDistance > 0) {
            const delta = currentDistance / previousDistance;
            const newZoom = Math.min(
              Math.max(MIN_ZOOM, zoom * delta),
              MAX_ZOOM
            );
            setZoom(newZoom);
          }
        }

        setTouchPoints(touches);
      } else if (e.touches.length === 1 && isDragging && touchStart) {
        setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    },
    [touchPoints, zoom, isDragging, touchStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setTouchStart(null);
  }, []);

  const handleDoubleClick = useCallback(() => {
    const newZoom = Math.min(zoom * 1.5, MAX_ZOOM);
    setZoom(newZoom);
  }, [zoom]);

  const handleZoomIn = () => {
    animateZoom(Math.min(zoom * 1.5, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    animateZoom(Math.max(zoom / 1.5, MIN_ZOOM));
  };

  const animateZoom = useCallback(
    (targetZoom: number) => {
      const startZoom = zoom;
      const startTime = performance.now();
      const duration = 300; // ms

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic easing
        const currentZoom =
          startZoom + (targetZoom - startZoom) * easedProgress;

        setZoom(currentZoom);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    },
    [zoom]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.addEventListener("wheel", handleWheel as EventListener, {
      passive: false,
    });
    map.addEventListener("touchstart", handleTouchStart as EventListener);
    map.addEventListener("touchmove", handleTouchMove as EventListener);
    map.addEventListener("touchend", handleTouchEnd as EventListener);

    return () => {
      map.removeEventListener("wheel", handleWheel as EventListener);
      map.removeEventListener("touchstart", handleTouchStart as EventListener);
      map.removeEventListener("touchmove", handleTouchMove as EventListener);
      map.removeEventListener("touchend", handleTouchEnd as EventListener);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getTransformOrigin = () => {
    if (userLocation) {
      const { x, y } = convertToPixelPosition(
        userLocation.lat,
        userLocation.lng,
        mapDimensions.width,
        mapDimensions.height,
        specificPadding
      );
      return `${x}px ${y}px`;
    }
    return "center center";
  };

  // Calculate safe area for header
  const headerHeight = showOutOfBoundsMessage ? 140 : 84;
  const bottomNavHeight = 64;

  // Update user location 
  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          // Silently update location without logging
          const { latitude, longitude } = position.coords;
          handleLocationUpdate(latitude, longitude);
        },
        () => {}, // Empty error handler to prevent console logs
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
          // Adding maximumAge to reduce update frequency
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []); // Empty dependency array means this only runs once on mount

  return (
    <div className="h-screen w-full flex flex-col relative bg-gray-100 overflow-hidden">
      {/* Static Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full flex justify-center items-center py-3 bg-white rounded-b-[35px] shadow-md">
          <Image
            src="/images/head.png"
            alt="header"
            width={90}
            height={45}
            priority
            className="w-auto h-auto"
          />
        </div>

        {showOutOfBoundsMessage && (
          <div
            className="w-full bg-red-100 border text-red-700 px-4 py-2 text-center text-sm"
            role="alert"
          >
            <span className="block">
              Your current location is out of bounds and has been disabled.
            </span>
          </div>
        )}
      </div>

      {batteryLevel !== null && batteryLevel < 20 && (
        <div
          className="fixed top-20 left-0 right-0 bg-yellow-100 border text-yellow-700 px-4 py-2 text-center text-sm"
          role="alert"
        >
          <span className="block">
            Battery level is low ({Math.round(batteryLevel)}%)
          </span>
        </div>
      )}

      {/* Main content area that centers the map */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{
          marginTop: `${headerHeight}px`,
          marginBottom: `${bottomNavHeight}px`,
          overflow: "hidden",
        }}
      >
        <div
          ref={mapRef}
          className="relative touch-manipulation"
          style={{
            width: `${mapDimensions.width}px`,
            height: `${mapDimensions.height}px`,
            transform: `scale(${zoom})`,
          }}
          onDoubleClick={handleDoubleClick}
        >
          <div className="relative w-full h-full">
            <Image
              src="/map_image.png"
              alt="Circuit map"
              width={mapDimensions.width}
              height={mapDimensions.height}
              priority
              className="w-full h-full object-cover"
              // style={{
              //   imageOrientation: "from-image",
              // }}
            />
            {mounted && (
              <div className="absolute inset-0">
                {COORDINATES.map((coord) => (
                  <LocationMarker
                    key={coord.label}
                    coordinate={coord}
                    position={convertToPixelPosition(
                      coord.lat,
                      coord.lng,
                      mapDimensions.width,
                      mapDimensions.height,
                      specificPadding
                    )}
                    scale={pinScale} // Pass the calculated pin scale
                  />
                ))}
                <UserLocation
                  mapWidth={mapDimensions.width}
                  mapHeight={mapDimensions.height}
                  onLocationUpdate={handleLocationUpdate}
                  isVisible={!showOutOfBoundsMessage}
                  scale={pinScale} // Also scale the user location pin
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50">
        <button
          className="bg-white rounded-full w-10 h-10 shadow-lg flex items-center justify-center text-black touch-manipulation"
          onClick={handleZoomIn}
          aria-label="Zoom in"
        >
          <span className="text-2xl">+</span>
        </button>
        <button
          className="bg-white rounded-full w-10 h-10 shadow-lg flex items-center justify-center text-black touch-manipulation"
          onClick={handleZoomOut}
          aria-label="Zoom out"
        >
          <span className="text-2xl">-</span>
        </button>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <F1BottomNavigation />
      </div>
    </div>
  );
}
