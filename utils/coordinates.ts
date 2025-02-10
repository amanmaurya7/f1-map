// Map boundaries
const MAP_BOUNDS = {
    north: 34.854529, // Maximum latitude
    south: 34.839992, // Minimum latitude
    east: 136.544621, // Maximum longitude
    west: 136.521328, // Minimum longitude
  }
  
  // Convert GPS coordinates to pixel positions on the map
  export function convertToPixelPosition(lat: number, lng: number, mapWidth: number, mapHeight: number) {
    const latRange = MAP_BOUNDS.north - MAP_BOUNDS.south
    const lngRange = MAP_BOUNDS.east - MAP_BOUNDS.west
  
    const x = ((lng - MAP_BOUNDS.west) / lngRange) * mapWidth
    const y = ((MAP_BOUNDS.north - lat) / latRange) * mapHeight
  
    return { x, y }
  }
  
  // Check if coordinates are within map bounds
  export function isWithinBounds(lat: number, lng: number): boolean {
    return lat >= MAP_BOUNDS.south && lat <= MAP_BOUNDS.north && lng >= MAP_BOUNDS.west && lng <= MAP_BOUNDS.east
  }

