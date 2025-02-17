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