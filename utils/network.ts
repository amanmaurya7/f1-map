/* eslint-disable @typescript-eslint/no-explicit-any */
// Map boundaries
const MAP_BOUNDS = {
  north: 34.854529, // Maximum latitude
  south: 34.839992, // Minimum latitude
  east: 136.544621, // Maximum longitude
  west: 136.521328, // Minimum longitude
};
import type { Coordinate } from "../types/map";
interface PaddingOptions {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}
const COORDINATES: Coordinate[] = [
  { lat: 34.845644, lng: 136.54065, label: "A" },
  { lat: 34.839992, lng: 136.543937, label: "B" },
  { lat: 34.847328, lng: 136.521328, label: "C" },
  { lat: 34.854529, lng: 136.544621, label: "D" },
];
export function convertToPixelPosition(
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
    top: 0.2,
    bottom: 0.1,
    left: 0.17,
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
// Check if coordinates are within map bounds
export function isWithinBounds(lat: number, lng: number): boolean {
  return (
    lat >= MAP_BOUNDS.south &&
    lat <= MAP_BOUNDS.north &&
    lng >= MAP_BOUNDS.west &&
    lng <= MAP_BOUNDS.east
  );
}

export interface NetworkStatus {
  type: string;
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export interface LocationTestResult {
  accuracy: number;
  timestamp: number;
  isIndoor: boolean;
  networkType: string;
  batteryLevel?: number;
  errorMargin?: number;
}

export function getNetworkStatus(): NetworkStatus {
  const connection = (navigator as any).connection;
  
  return {
    type: connection?.type || 'unknown',
    isOnline: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt
  };
}

export function monitorNetworkChanges(callback: (status: NetworkStatus) => void): () => void {
  const updateStatus = () => callback(getNetworkStatus());
  
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  
  const connection = (navigator as any).connection;
  if (connection) {
    connection.addEventListener('change', updateStatus);
  }

  return () => {
    window.removeEventListener('online', updateStatus);
    window.removeEventListener('offline', updateStatus);
    if (connection) {
      connection.removeEventListener('change', updateStatus);
    }
  };
}

export function checkLocationAccuracy(position: GeolocationPosition): LocationTestResult {
  const { coords, timestamp } = position;
  const networkStatus = getNetworkStatus();
  
  return {
    accuracy: coords.accuracy,
    timestamp,
    isIndoor: coords.accuracy > 30, // Assume indoor if accuracy is poor
    networkType: networkStatus.type,
    errorMargin: calculateErrorMargin(coords.accuracy, networkStatus.type)
  };
}

function calculateErrorMargin(accuracy: number, networkType: string): number {
  let baseError = accuracy;
  
  switch(networkType) {
    case 'wifi':
      baseError *= 0.8;
      break;
    case 'cellular':
      baseError *= 1.2;
      break;
    case 'none':
      baseError *= 1.5;
      break;
  }
  
  return baseError;
}

export function isLocationStable(positions: GeolocationPosition[], timeWindow: number = 5000): boolean {
  if (positions.length < 2) return true;
  
  const recentPositions = positions.filter(
    pos => Date.now() - pos.timestamp < timeWindow
  );
  
  if (recentPositions.length < 2) return true;
  
  const variations = recentPositions.map((pos, i) => {
    if (i === 0) return 0;
    const prev = recentPositions[i - 1];
    return calculateDistance(
      prev.coords.latitude,
      prev.coords.longitude,
      pos.coords.latitude,
      pos.coords.longitude
    );
  });
  
  const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
  return avgVariation < 5; // Consider stable if average movement is less than 5 meters
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}