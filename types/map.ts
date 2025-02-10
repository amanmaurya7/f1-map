export interface Coordinate {
    lat: number
    lng: number
    label: string
  }
  
  export interface MapProps {
    coordinates: Coordinate[]
    userLocation?: GeolocationPosition | null
  }
  
  export interface MarkerProps {
    coordinate: Coordinate
    position: { x: number; y: number }
  }
  
  