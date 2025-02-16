/* eslint-disable @typescript-eslint/no-explicit-any */
export function getNetworkStatus(): Promise<{ type: string; speed?: number }> {
    return new Promise((resolve) => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (!connection) {
        resolve({ type: 'unknown' });
        return;
      }
      
      resolve({
        type: connection.effectiveType || 'unknown',
        speed: connection.downlink || undefined
      });
    });
  }
  
  export function monitorNetworkChanges(callback: (status: { type: string; speed?: number }) => void) {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection || typeof connection.addEventListener !== 'function') {
      return () => {};
    }
    
    const handler = () => {
      callback({
        type: connection.effectiveType || 'unknown',
        speed: connection.downlink || undefined
      });
    };
  
    connection.addEventListener('change', handler);
    
    return () => connection.removeEventListener('change', handler);
  }
  