import { useState, useEffect } from 'react'

export function useClientMount() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
