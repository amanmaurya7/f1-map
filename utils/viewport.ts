export function calculateInitialZoom(mapWidth: number, mapHeight: number): number {
  const viewportWidth = window.innerWidth - 32; // Accounting for padding (16px on each side)
  const viewportHeight = window.innerHeight - 148 - 64; // Accounting for header (84px or 140px) and bottom nav (64px)
  
  const horizontalRatio = viewportWidth / mapWidth;
  const verticalRatio = viewportHeight / mapHeight;
  
  // Use the smaller ratio to ensure the entire map fits
  return Math.min(horizontalRatio, verticalRatio, 1) * 0.9; // 0.9 to add some margin
}
