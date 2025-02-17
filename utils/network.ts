/* eslint-disable @typescript-eslint/no-explicit-any */
interface NetworkInformation {
  effectiveType?: string;
  type?: string;
  downlink?: number;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}

export function getNetworkStatus(): Promise<{ type: string; speed?: number }> {
  return new Promise((resolve) => {
    if (!navigator.connection) {
      resolve({ type: "unknown" });
      return;
    }

    const connection = navigator.connection as any;
    resolve({
      type: connection.effectiveType || connection.type || "unknown",
      speed: connection.downlink,
    });
  });
}

export function monitorNetworkChanges(
  callback: (status: { type: string; speed?: number }) => void
) {
  const connection = navigator.connection as any;
  if (!connection) return () => {};

  const handler = () => {
    callback({
      type: connection.effectiveType || connection.type || "unknown",
      speed: connection.downlink,
    });
  };

  // Check network status every 2 seconds
  const intervalId = setInterval(handler, 2000);

  // Return a function to clear the interval
  return () => clearInterval(intervalId);
}
