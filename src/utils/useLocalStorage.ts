import { Dispatch, SetStateAction, useMemo, useSyncExternalStore } from 'react'

type SetValue<T> = Dispatch<SetStateAction<T>>

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener('local-storage', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('local-storage', callback)
  }
}

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const readValue = () => {
    try {
      return window.localStorage.getItem(key)
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error)
      return null
    }
  }

  const stored = useSyncExternalStore(subscribe, readValue, () => null)
  const storedValue = useMemo(() => {
    if (stored === null) return initialValue
    try {
      return JSON.parse(stored) as T
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error)
      return initialValue
    }
  }, [stored, key, initialValue])

  const setValue: SetValue<T> = value => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value
      window.localStorage.setItem(key, JSON.stringify(newValue))
      window.dispatchEvent(new Event('local-storage'))
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
