import { useEffect } from 'react'

export function useRefreshConfig<T>(generate: () => T, setConfig: (v: T) => void) {
  useEffect(() => {
    const i = setInterval(() => {
      setConfig(generate())
    }, 30000)

    return () => clearInterval(i)
  }, [])
}
