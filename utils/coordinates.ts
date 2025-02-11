// Map boundaries
const MAP_BOUNDS = {
    north: 34.854529, // Maximum latitude
    south: 34.839992, // Minimum latitude
    east: 136.544621, // Maximum longitude
    west: 136.521328, // Minimum longitude
  }
  
  // Convert GPS coordinates to pixel positions on the map
  export function convertToPixelPosition(lat: number, lng: number, mapWidth: number, mapHeight: number, p0: { USER: { top: number; bottom: number; left: number; right: number } }) {
    const latRange = MAP_BOUNDS.north - MAP_BOUNDS.south
    const lngRange = MAP_BOUNDS.east - MAP_BOUNDS.west
  
    const mapPadding = {
      top: 0.15, // 10% padding from top
      bottom: 0.1, // 10% padding from bottom
      left: 0.1, // 10% padding from left
      right: 0.3, // 10% padding from right
    }
  
    const usableWidth = mapWidth * (1 - mapPadding.left - mapPadding.right)
    const usableHeight = mapHeight * (1 - mapPadding.top - mapPadding.bottom)
  
    const x = ((lng - MAP_BOUNDS.west) / lngRange) * usableWidth + mapWidth * mapPadding.left
    const y = ((MAP_BOUNDS.north - lat) / latRange) * usableHeight + mapHeight * mapPadding.top
  
    return { x, y }
  }
  
  // Check if coordinates are within map bounds
  export function isWithinBounds(lat: number, lng: number): boolean {
    return lat >= MAP_BOUNDS.south && lat <= MAP_BOUNDS.north && lng >= MAP_BOUNDS.west && lng <= MAP_BOUNDS.east
  }

