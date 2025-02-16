import React from 'react'
import type { Coordinate } from '../types/map'

interface LocationMarkerProps {
    coordinate: Coordinate
    position: { x: number; y: number }
    scale?: number
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({ coordinate, position, scale = 1 }) => {
    const baseSize = 24
    const size = baseSize * scale
    const offsetX = size / 2
    const offsetY = size

    return (
        <div
            className="absolute cursor-pointer"
            style={{
                left: `${position.x - offsetX}px`,
                top: `${position.y - offsetY}px`,
                transition: 'transform 0.2s ease-out',
            }}
        >
            <div className="relative">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 150"
                    width={size}
                    height={size}
                >
                    <path
                        d="M50 0 C22.4 0 0 22.4 0 50 C0 87.5 50 150 50 150 C50 150 100 87.5 100 50 C100 22.4 77.6 0 50 0Z"
                        fill="#FF4444"
                        stroke="#CC0000"
                        strokeWidth="2"
                    />
                    <circle cx="50" cy="50" r="35" fill="white" />
                    <text
                        x="50"
                        y="55"
                        fontFamily="Arial, sans-serif"
                        fontSize={60 * scale}
                        fill="black"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {coordinate.label}
                    </text>
                </svg>
            </div>
        </div>
    )
}
