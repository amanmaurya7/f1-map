import type { MarkerProps } from "../types/map"

export function LocationMarker({ coordinate, position }: MarkerProps) {
    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            <div className="relative">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 100 150" 
                    width="24" 
                    height="24"
                >
                    <path 
                        d="M50 0 C22.4 0 0 22.4 0 50 C0 87.5 50 150 50 150 C50 150 100 87.5 100 50 C100 22.4 77.6 0 50 0Z"
                        fill="#FF4444"
                        stroke="#CC0000"
                        strokeWidth="2"
                    />
                    <circle cx="50" cy="50" r="35" fill="white"/>
                    <text 
                        x="50" 
                        y="55" 
                        fontFamily="Arial, sans-serif" 
                        fontSize="40"
                        fontWeight="bold"
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
