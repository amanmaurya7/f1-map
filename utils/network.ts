export function getNetworkStatus(): Promise<{ type: string; speed?: number }> {
  return new Promise((resolve) => {
    if (!navigator.connection) {
      resolve({ type: 'unknown' });
      return;
    }

    const connection = navigator.connection as any;
    resolve({
      type: connection.effectiveType || connection.type || 'unknown',
      speed: connection.downlink
    });
  });
}

export function monitorNetworkChanges(callback: (status: { type: string; speed?: number }) => void) {
  const connection = navigator.connection as any;
  if (!connection) return () => {};

  const handler = () => {
    callback({
      type: connection.effectiveType || connection.type || 'unknown',
      speed: connection.downlink
    });
  };

  connection.addEventListener('change', handler);
  return () => connection.removeEventListener('change', handler);
}
